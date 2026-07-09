import { describe, expect, it } from "vitest";

import {
  buildRepairMessages,
  maxRepairRetries,
  shouldRepair,
} from "@/features/ai/repair/repair-strategy";

describe("repair strategy", () => {
  it("limits repair attempts", () => {
    expect(maxRepairRetries).toBe(2);
    expect(shouldRepair(0)).toBe(true);
    expect(shouldRepair(1)).toBe(true);
    expect(shouldRepair(2)).toBe(false);
  });

  it("builds repair messages with validation details", () => {
    const messages = buildRepairMessages({
      rawOutput: "{ bad json",
      validationErrors: [
        {
          errorType: "JSON_PARSE",
          code: "JSON_ERROR",
          field: "$",
          reason: "Unexpected token",
          fixStrategy: "Return valid JSON.",
        },
      ],
    });

    expect(messages).toHaveLength(2);
    expect(messages[1]?.content).toContain("Unexpected token");
  });
});
