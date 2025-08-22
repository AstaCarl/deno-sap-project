import { RawMaterial, IngredientWithPercentage } from "../types.ts";
import { ProductService } from "./products-service.ts";

export class IngredientsService {
  static getIngredients(rawMaterials: RawMaterial[]) {
    // calculate the percentages with helper function
    const ingredientsWithPercentages = this.calculatePercentages(rawMaterials);

    // sort the ingredients by percentage, decending order
    const sortedIngredients = this.sortByPercentage(ingredientsWithPercentages);

    return this.formatIngredientsString(sortedIngredients);
  }

  // Helper functions to create the ingredients string

  // Calculates the percentage of each ingredient based on its weight relativeto the total weight
  private static calculatePercentages(
    rawMaterials: RawMaterial[]
  ): IngredientWithPercentage[] {
    // Calculate total weight in grams by summing up the weight of each raw material
    const totalWeightGrams = rawMaterials.reduce((sum, material) => {
      return sum + material.quantityKg * 1000;
    }, 0);

    // map through each raw material to calculate percentage by dividing its weight by the total weight
    return rawMaterials.map((material) => {
      const weightInGrams = material.quantityKg * 1000;
      const percentage = (weightInGrams / totalWeightGrams) * 100;

      // Return an object
      return {
        itemName: material.itemName,
        itemCode: material.itemCode,
        description: material.ingredientsDescription || "",
        quantityKg: material.quantityKg,
        percentage,
      };
    });
  }

  static async getIngredientsOnly(productPath: string, itemPath: string) {
    const fullProductTree = await ProductService.getFullProductTree(
      productPath,
      itemPath
    );

    // Filter to only get "Råvare" items
    const rawMaterialsOnly = fullProductTree.filter(
      (item) => item.U_CCF_Type === "Råvare"
    );
    const sortedIngredients = rawMaterialsOnly.sort((a, b) => b.quantity - a.quantity);

    // Map to the simplified ingredient format
    return sortedIngredients.map(this.mapIngredients);
    // return rawMaterialsOnly.map(this.mapIngredients);
  }

  private static mapIngredients(ingredient: any) {
    return {
      itemCode: ingredient.ItemCode,
      itemName: ingredient.ItemName,
      ingredient: ingredient.U_CCF_Ingrediens_DA,
      calculatedQuantity: ingredient.quantity,
    };
  }

  // Sorts ingredients by percentage in descending order
  private static sortByPercentage(
    ingredients: IngredientWithPercentage[]
  ): IngredientWithPercentage[] {
    return ingredients.sort((a, b) => b.percentage - a.percentage);
  }

  // create the string representation of the ingredients
  private static formatIngredientsString(
    ingredients: IngredientWithPercentage[]
  ): string {
    // map through each ingredient and format with helper function, join them with a comma
    return ingredients
      .map((ingredient) => this.formatSingleIngredient(ingredient))
      .join(", ");
  }

  // format a single ingredient with its percentage
  private static formatSingleIngredient(
    ingredient: IngredientWithPercentage
  ): string {
    // Add chocolate-specific information to description
    const description = this.addChocolateInfo(
      ingredient.itemName,
      ingredient.description
    );
    // create the percentage string
    const percentage = `${ingredient.percentage.toFixed(0)}%`;

    // Insert the percentage into the description
    return this.insertPercentage(description, percentage);
  }

  // Add chocolate-specific information to description
  private static addChocolateInfo(
    itemName: string,
    description: string
  ): string {
    // Check if the item name contains dark or milk chocolate and add specific information
    if (itemName.includes("Mørk chokolade")) {
      return description + ". Mørk chokolade: Mindst 60% kakaotørstof.";
    }
    if (itemName.includes("Mælkechokolade")) {
      return description + ". Mælkechokolade: Mindst 30% kakaotørstof.";
    }
    return description;
  }

  // Insert the percentage into the description at the correct position
  private static insertPercentage(
    description: string,
    percentage: string
  ): string {
    // Find the index of the first opening parenthesis
    const openParenIndex = description.indexOf("(");

    // If no opening parenthesis is found, add the percentage at the end
    if (openParenIndex === -1) {
      // No parentheses found, add percentage at the end
      return `${description} (${percentage})`;
    }

    // Split at first parenthesis and insert percentage
    const mainPart = description.substring(0, openParenIndex).trim();
    const detailsPart = description.substring(openParenIndex);

    // Return the formatted string with percentage inserted
    return `${mainPart} (${percentage}) ${detailsPart}`;
  }
}
