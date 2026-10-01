import { describe, expect, it } from "vitest";
import { DIRECT_WARD_DISTRICT_NAME, vietnamLocations } from "../utils/vietnamLocations";

describe("vietnamLocations", () => {
  it("contains the current full Vietnam province and ward-level dataset", () => {
    const wardCount = vietnamLocations.reduce(
      (sum, province) => sum + province.districts.reduce((districtSum, district) => districtSum + district.wards.length, 0),
      0
    );

    expect(vietnamLocations).toHaveLength(34);
    expect(wardCount).toBe(3321);
    expect(vietnamLocations.find((province) => province.code === "79")?.name).toBe("Thành phố Hồ Chí Minh");
    expect(
      vietnamLocations
        .find((province) => province.code === "79")
        ?.districts[0].wards.some((ward) => ward.name === "Phường Sài Gòn")
    ).toBe(true);
    expect(vietnamLocations.every((province) => province.districts[0].name === DIRECT_WARD_DISTRICT_NAME)).toBe(true);
  });
});
