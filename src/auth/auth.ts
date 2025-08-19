import { UserCredentials } from "../types.ts";
import { CONFIG } from "../config.ts";
import { SessionService } from "../auth/session-service.ts";

// Function to log in and save session
export const login = async () => {

  const user: UserCredentials = {
    CompanyDB: `${CONFIG.COMPANY_DB}`,
    UserName: `${CONFIG.USER_NAME}`,
    Password: `${CONFIG.PASSWORD}`,
  };

  try {
    const res = await fetch(`${CONFIG.BASE_URL}/Login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (res.ok) {
      const data = await res.json();
      const createdAt = new Date().toISOString();
      console.log("Login successful:", data);
      SessionService.saveSession(data.SessionId, createdAt); // Save session ID and creation time
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
};

// logout function to clear session
export const logout = async () => {
  const sessionId = await SessionService.getSession();
  const res = await fetch(`${CONFIG.BASE_URL}/Logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `B1SESSION=${sessionId}`, // Include session ID in the request headers
    },
  });

  if (res.ok) {
    console.log("Logout successful");
    Deno.writeFile("session.json", new TextEncoder().encode("{}")); // Clear session file
  } else {
    throw new Error(`Logout failed: ${res.statusText}`);
  }
};
