import { RawMaterial, Nutrition } from "../types.ts";


export class NutritionService {
  static calculateNutrition(rawMaterials: RawMaterial[]) {
    // Calculate total weight first
    const totalWeight = rawMaterials.reduce((sum, material) => {
      return sum + material.quantityKg * 1000; // Converting kg to grams
    }, 0);

    const nutrition: Nutrition = {
      fat: 0,
      protein: 0,
      carbohydrates: 0,
      salt: 0,
      sugars: 0,
      energyKJ: 0,
      energyKcal: 0,
      fattyAcids: 0,
    };

    rawMaterials.forEach((material) => {
      const weightInGrams = material.quantityKg * 1000; // Convert kg to grams
      const percentage = weightInGrams / totalWeight; // Calculate percentage of total

      // Multiply values by the percentage runs for each component and adds it together
      nutrition.fat += material.fat * percentage;
      nutrition.protein += material.protein * percentage;
      nutrition.carbohydrates += material.carbohydrates * percentage;
      nutrition.salt += material.salt * percentage;
      nutrition.sugars += material.sugars * percentage;
      nutrition.energyKJ += material.energyKJ * percentage;
      nutrition.energyKcal += material.energyKcal * percentage;
      nutrition.fattyAcids += material.fattyAcids * percentage;
    });

    return {
      totalWeightGrams: totalWeight,
      nutrition: nutrition,
    };
  }
}
