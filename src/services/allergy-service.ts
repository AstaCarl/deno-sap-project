import { RawMaterial, AllergenStatus, Allergies } from "../types.ts";
import { ALLERGEN_TRANSLATIONS } from "../lang/allergies.ts";

// AllergyService class to analyze and summarize allergies in raw materials
export class AllergyService {
  // List of nut allergens for special handling
  private static readonly NUT_ALLERGENS = [
    "almonds",
    "hazelnuts",
    "walnuts",
    "cashews",
    "pecans",
    "pistachios",
    "macadamias",
  ] as const;

  private static readonly PRIORITY = {
    [AllergenStatus.InProduct]: 3,
    [AllergenStatus.MayContainTracesOf]: 2,
    [AllergenStatus.FreeFrom]: 1,
  };

  // Method to analyze allergies in raw materials
  static analyzeAllergies(rawMaterials: RawMaterial[]) {
    // call the helper function to initialize allergies
    const finalProductAllergies: Allergies = this.initializeAllergies();

    // loop through each raw materials
    rawMaterials.forEach((material) => {
      if (!material.allergies) return; // Skip if no allergy data

      // Object.entries returns an array of key-value pairs
      // [["gluten", "FreeFrom"], ["eggs", "InProduct"]], etc.
      // Loop through each allergen in the material's allergies
      // Assigns the [allergen, staus] to allergen and status variables
      // allergen="gluten", status="FreeFrom"
      Object.entries(material.allergies).forEach(
        ([allergen, rawMaterialStatus]) => {
          // Gets the current status of the allergen from the product allergies
          // e.g., productAllergies[gluten] = AllergenStatus.FreeFrom
          // e.g., productAllergies[eggs] = AllergenStatus.InProduct
          const currentStatusInFinalProduct =
            finalProductAllergies[allergen as keyof Allergies];

          // Only upgrade if new status has higher priority
          // passed to method is the status, from the raw material, current status in the final product
          // e.g., rawMaterialStatus = AllergenStatus.InProduct
          // e.g., currentStatusInFinalProduct = AllergenStatus.FreeFrom
          // e.g., shouldUpgradeAllergenStatus(AllergenStatus.InProduct, AllergenStatus.FreeFrom) = true
          // e.g., shouldUpgradeAllergenStatus(AllergenStatus.FreeFrom, AllergenStatus.InProduct) = false
          if (
            this.shouldUpgradeAllergenStatus(
              rawMaterialStatus,
              currentStatusInFinalProduct
            )
          ) {
            // Upgrade the allergen status in the final product if the raw material's status is higher priority
            finalProductAllergies[allergen as keyof Allergies] =
              rawMaterialStatus;
          }
        }
      );
    });

    return {
      finalProductAllergies,
      allergenString: this.createAllergyString(finalProductAllergies), // Create a string representation of the allergies
    };
  }

  private static shouldUpgradeAllergenStatus(
    rawMaterialStatus: AllergenStatus,
    currentStatusInFinalProduct: AllergenStatus
  ): boolean {
    // Compare the priority of the new status with the current status
    // Sugar: shouldUpgrade("Free from", "Free from") → 1 > 1 = false → No update
    // Cocoa: shouldUpgrade("Free from", "May contain traces of") → 1 > 2 = false → No update
    // Milk powder: shouldUpgrade("In product", "Free from") → 3 > 1 = true → UPDATE!
    // Egg: shouldUpgrade("May contain traces of", "In product") → 2 > 3 = false → No update
    return (
      this.PRIORITY[rawMaterialStatus] >
      this.PRIORITY[currentStatusInFinalProduct]
    );
  }

  private static createAllergyString(allergies: Allergies): string {
    const allergenList: string[] = [];

    // Check for nut allergens first
    const hasNutsTraces = this.NUT_ALLERGENS.some(
      (nut) => allergies[nut] === AllergenStatus.MayContainTracesOf
    );

    if (hasNutsTraces) {
      allergenList.push("nødder");
    }

    // check other allergens
    Object.entries(allergies).forEach(([allergen, status]) => {
      if (
        status === AllergenStatus.MayContainTracesOf &&
        !this.NUT_ALLERGENS.includes(allergen as any)
      ) {
        allergenList.push(
          ALLERGEN_TRANSLATIONS[allergen as keyof typeof ALLERGEN_TRANSLATIONS]
        );
      }
    });
    return allergenList.length > 0
      ? `Kan indeholde spor af ${allergenList.join(", ")}`
      : "";
  }

  // Helper function to initialize allergies with all allergens set to "Free from"
  private static initializeAllergies(): Allergies {
    return {
      gluten: AllergenStatus.FreeFrom,
      crustaceans: AllergenStatus.FreeFrom,
      eggs: AllergenStatus.FreeFrom,
      fish: AllergenStatus.FreeFrom,
      peanuts: AllergenStatus.FreeFrom,
      soy: AllergenStatus.FreeFrom,
      milk: AllergenStatus.FreeFrom,
      almonds: AllergenStatus.FreeFrom,
      hazelnuts: AllergenStatus.FreeFrom,
      walnuts: AllergenStatus.FreeFrom,
      cashews: AllergenStatus.FreeFrom,
      pecans: AllergenStatus.FreeFrom,
      pistachios: AllergenStatus.FreeFrom,
      macadamias: AllergenStatus.FreeFrom,
      celery: AllergenStatus.FreeFrom,
      mustard: AllergenStatus.FreeFrom,
      sesame: AllergenStatus.FreeFrom,
      sulphurDioxide: AllergenStatus.FreeFrom,
      lupin: AllergenStatus.FreeFrom,
      molluscs: AllergenStatus.FreeFrom,
    };
  }
}
