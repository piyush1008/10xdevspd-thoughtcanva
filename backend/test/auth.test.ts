
import { describe, it , expect } from "bun:test";
import axios from "axios";


describe("GET /health", () => {
    it("should check the health of the app", async () => {

        const res = await axios.get(`http://localhost:3000/health`);

        expect(res.status).toBe(200);
        expect(res.data).toEqual({ status: "OK" });

    })
})
