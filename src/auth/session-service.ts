
export class SessionService {
  static async isSessionValid() {
    try {
      const session = await Deno.readTextFile("session.json"); // Read session data from file
      if (!session || session.trim() === "") {
        console.log("Session file is empty.");
        return false;
      }

      const sessionObj = JSON.parse(session);

      if (!sessionObj.sessionId || !sessionObj.createdAt) {
        console.log("Session data is incomplete or missing.");
        return false; // If session data is not complete, consider it invalid
      }

      const now = new Date();
      const createdAt = new Date(sessionObj.createdAt);

      const timeDifference = now.getTime() - createdAt.getTime(); // Calculate time difference in milliseconds
      const sessionDuration = 30 * 60 * 1000; // 30 minutes in milliseconds

      // Check if the session is older than 30 minutes
      if (timeDifference > sessionDuration) {
        console.log("Session has expired.");
        return null;
      } else {
        // If the session is still valid
        console.log("Session is still valid.");
        return sessionObj.sessionId; // Return the session ID
      }
    } catch (error) {
      console.error("Error checking session validity:", error);
      return null; // If an error occurs, consider the session invalid
    }
  }

  static async saveSession(sessionId: string, createdAt: string) {
    await Deno.writeTextFile(
      "session.json",
      JSON.stringify({
        sessionId,
        createdAt,
      })
    );
    console.log("Session saved successfully.");
  }

  static async getSession() {
    const sessionData = await Deno.readTextFile("session.json");
    const sessionId = JSON.parse(sessionData).sessionId;
    return sessionId;
  }
}
