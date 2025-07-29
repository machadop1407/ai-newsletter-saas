import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { inngest } from "@/inngest/client";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Get the user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to save preferences." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { categories, frequency, email } = body;

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { error: "Categories array is required and must not be empty" },
        { status: 400 }
      );
    }

    if (!frequency || !["daily", "weekly", "biweekly"].includes(frequency)) {
      return NextResponse.json(
        { error: "Valid frequency is required (daily, weekly, biweekly)" },
        { status: 400 }
      );
    }

    // Save user preferences to database
    const { error: upsertError } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: user.id,
          categories: categories,
          frequency: frequency,
          email: email,
          is_active: true,
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("Error saving preferences:", upsertError);
      return NextResponse.json(
        { error: "Failed to save preferences" },
        { status: 500 }
      );
    }

    // Schedule the first newsletter based on frequency
    let scheduleTime: Date;
    const now = new Date();

    switch (frequency) {
      case "daily":
        // Schedule for tomorrow at 9 AM
        scheduleTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        scheduleTime.setHours(9, 0, 0, 0);
        break;
      case "weekly":
        // Schedule for next week on the same day at 9 AM
        scheduleTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        scheduleTime.setHours(9, 0, 0, 0);
        break;
      case "biweekly":
        // Schedule for 3 days from now at 9 AM
        scheduleTime = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        scheduleTime.setHours(9, 0, 0, 0);
        break;
      default:
        scheduleTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        scheduleTime.setHours(9, 0, 0, 0);
    }

    // Send event to Inngest to schedule the newsletter
    const { ids } = await inngest.send({
      name: "newsletter.schedule",
      data: {
        userId: user.id,
        email: email,
        categories: categories,
        frequency: frequency,
        scheduledFor: scheduleTime.toISOString(),
        isTest: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Preferences saved and newsletter scheduled",
      scheduleId: ids[0],
    });
  } catch (error) {
    console.error("Error in user-preferences API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

  // Get the user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to update preferences." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { is_active } = body;

    // Update user preferences
    const { error: updateError } = await supabase
      .from("user_preferences")
      .update({ is_active })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating preferences:", updateError);
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 }
      );
    }

    // If deactivating the newsletter, cancel all scheduled functions for this user
    if (!is_active) {
      try {
        // Cancel all pending newsletter.schedule events for this user
        await cancelUserNewsletterEvents(user.id);
      } catch (cancelError) {
        console.error("Error canceling scheduled events:", cancelError);
        // Don't fail the request if cancellation fails, just log it
      }
    } else {
      // If reactivating the newsletter, schedule the next one
      try {
        await rescheduleUserNewsletter(user.id);
      } catch (rescheduleError) {
        console.error("Error rescheduling newsletter:", rescheduleError);
        // Don't fail the request if rescheduling fails, just log it
      }
    }

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully",
    });
  } catch (error) {
    console.error("Error in user-preferences PATCH API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Function to cancel all scheduled newsletter events for a user
async function cancelUserNewsletterEvents(userId: string) {
  const INNGEST_API =
    process.env.NODE_ENV === "production"
      ? "https://api.inngest.com/v1"
      : "http://localhost:8288/v1";

  try {
    // Get all events for this user
    const response = await fetch(`${INNGEST_API}/events`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const events = await response.json();

    // Filter events for this user that are newsletter.schedule events
    const userNewsletterEvents =
      events.data?.filter(
        (event: any) =>
          event.name === "newsletter.schedule" && event.data?.userId === userId
      ) || [];

    console.log(
      `Found ${userNewsletterEvents.length} newsletter events for user ${userId}`
    );

    // Log the events that would be affected
    for (const event of userNewsletterEvents) {
      console.log(
        `Event ${event.id} scheduled for ${new Date(event.ts).toISOString()}`
      );
    }

    // Note: We can't actually cancel events via API, but the function will check
    // the user's is_active status and exit early if they've paused their newsletter
    console.log(
      `User ${userId} newsletter paused. Existing events will be skipped when they run.`
    );
  } catch (error) {
    console.error("Error in cancelUserNewsletterEvents:", error);
    throw error;
  }
}

// Function to reschedule newsletter for a user when they reactivate
async function rescheduleUserNewsletter(userId: string) {
  const supabase = await createClient();

  try {
    // Get user preferences
    const { data: preferences, error } = await supabase
      .from("user_preferences")
      .select("categories, frequency, email")
      .eq("user_id", userId)
      .single();

    if (error || !preferences) {
      throw new Error("User preferences not found");
    }

    // Calculate next schedule time
    const now = new Date();
    let nextScheduleTime: Date;

    switch (preferences.frequency) {
      case "daily":
        nextScheduleTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case "weekly":
        nextScheduleTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case "biweekly":
        nextScheduleTime = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        break;
      default:
        nextScheduleTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    nextScheduleTime.setHours(9, 0, 0, 0);

    // Schedule the next newsletter
    await inngest.send({
      name: "newsletter.schedule",
      data: {
        userId: userId,
        email: preferences.email,
        categories: preferences.categories,
        frequency: preferences.frequency,
      },
      ts: nextScheduleTime.getTime(),
    });

    console.log(
      `Rescheduled newsletter for user ${userId} at ${nextScheduleTime.toISOString()}`
    );
  } catch (error) {
    console.error("Error in rescheduleUserNewsletter:", error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Get the user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to fetch preferences." },
      { status: 401 }
    );
  }

  try {
    // Get user preferences
    const { data: preferences, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("Error fetching preferences:", error);
      return NextResponse.json(
        { error: "Failed to fetch preferences" },
        { status: 500 }
      );
    }

    if (!preferences) {
      return NextResponse.json(
        { error: "No preferences found" },
        { status: 404 }
      );
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error in user-preferences GET API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
