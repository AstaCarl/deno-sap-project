import { RawMaterial, AllergenStatus, Allergies } from "../types.ts";

export class AllergyService {
  private static readonly NUT_ALLERGENS = [
    "almonds",
    "hazelnuts",
    "walnuts",
    "cashews",
    "pecans",
    "pistachios",
    "macadamias",
  ] as const;

  static analyzeAllergies(rawMaterials: RawMaterial[]) {
    // call the helper function to initialize allergies
    const productAllergies: Allergies = this.initializeAllergies();

    // Initialize an array to keep track of allergens present in the bar

    // process each raw material for allergens
    for (const material of rawMaterials) {
      if (!material.allergies) continue;

      for (const [allergenKey, status] of Object.entries(material.allergies)) {
        const currentStatus = productAllergies[allergenKey as keyof Allergies];

        // Simple priority: InProduct > MayContainTracesOf > FreeFrom
        if (
          status === AllergenStatus.InProduct ||
          (status === AllergenStatus.MayContainTracesOf &&
            currentStatus === AllergenStatus.FreeFrom)
        ) {
          (productAllergies as any)[allergenKey] = status;
        }
      }
    }
    return {
      productAllergies,
      allergenString: this.createAllergyString(productAllergies),
    };
  }

  private static createAllergyString(allergies: Allergies): string {
    const allergenList: string[] = [];

    //check for nuts
    const hasNuts = this.NUT_ALLERGENS.some(
      (nut) => allergies[nut] !== AllergenStatus.FreeFrom
    );
    if (hasNuts) {
      allergenList.push("nødder");
    }

    // check other allergens
    Object.entries(allergies).forEach(([allergen, status]) => {
      if (
        status !== AllergenStatus.FreeFrom &&
        !this.NUT_ALLERGENS.includes(allergen as any)
      ) {
        allergenList.push(allergen);
      }
    });
    return allergenList.length > 0
    ? `Indeholder spor af ${allergenList.join(", ")}`
    : "Ingen allergener";
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
