import { SessionService } from "../authentication/session-service.ts";

// Sap api class to handle API requests
export class SapApi {
  // Method to make a GET request to the SAP API
  static async get(endPoint: string) {
    const sessionId = await SessionService.getSession();

    try {
      const res = await fetch(`${Deno.env.get("BASE_URL")}/${endPoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `B1SESSION=${sessionId}`, // Include session ID in the request headers
        },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      console.error("Error making API request:", error);
    }
  }
}
