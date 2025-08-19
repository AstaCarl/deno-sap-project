import { SessionService } from "../auth/session-service.ts";

export class SapApi {
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