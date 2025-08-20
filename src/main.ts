import { AllergyService } from "./services/allergy-service.ts";
import { login, logout } from "./authentication/auth.ts";
import { SessionService } from "./authentication/session-service.ts";
import { IngredientsService } from "./services/ingredients-service.ts";
import { NutritionService } from "./services/nutrition-service.ts";
import { ProductService } from "./services/products-service.ts";

const productFields = ["TreeCode", "ProductDescription", "ProductTreeLines"];

const itemFields = [
  "ItemCode",
  "ItemName",
  "TreeType",
  "U_CCF_Type",
  "U_BOYX_Energi",
  "U_BOYX_Energik",
  "U_BOYX_fedt",
  "U_BOYX_fedtsyre",
  "U_BOYX_Kulhydrat",
  "U_BOYX_sukkerarter",
  "U_BOYX_Protein",
  "U_BOYX_salt",
  "U_CCF_Ingrediens_DA",
];

const productPath = `?$select=${productFields.join(",")}`;
const itemPath = `$select=${itemFields.join(",")}`;

// Ensure session is valid before making API calls
const ensureValidSession = async () => {
  const sessionValid = await SessionService.isSessionValid();
  if (!sessionValid) {
    console.log("Session is not valid. Please log in again.");
    await login();
  }
  const sessionId = await SessionService.getSession();
  if (!sessionId) {
    throw new Error("No session ID found.");
  }
  return sessionId;
};

const getNutritionOnly = async () => {
  try {
    await ensureValidSession();
    const rawMaterialsWithAllergies =
      await ProductService.getRawMaterialsWithAllergies(productPath, itemPath);
    const nutrition = NutritionService.calculateNutrition(
      rawMaterialsWithAllergies
    );
    console.log("nutrition", nutrition);
    return nutrition;
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

// Function to get raw materials with allergies
const getAllergiesOnly = async () => {
  try {
    await ensureValidSession();
    // Fetch raw materials and include allergies
    const rawMaterialsWithAllergies =
      await ProductService.getRawMaterialsWithAllergies(productPath, itemPath);

    // Call AllergyService to analyze allergies to return the allergy analysis list and string
    const analyzeAllergies = await AllergyService.analyzeAllergies(
      rawMaterialsWithAllergies
    );
    console.log("allergy analysis", analyzeAllergies);
    return analyzeAllergies;
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

// Function to get full analysis including nutrition and allergies
const getFullAnalysis = async () => {
  try {
    await ensureValidSession();

    // Fetch raw materials with allergies
    const rawMaterialsWithAllergies =
      await ProductService.getRawMaterialsWithAllergies(productPath, itemPath);

    // Call AllergyService, IngredientsService, and NutritionService in parallel
    const [analyzeAllergies, ingredients, nutrition] = await Promise.all([
      AllergyService.analyzeAllergies(rawMaterialsWithAllergies),
      IngredientsService.getIngredients(rawMaterialsWithAllergies),
      NutritionService.calculateNutrition(rawMaterialsWithAllergies),
    ]);

    // Combine the results into a single string
    const fullIngredientsString = `${ingredients} ${analyzeAllergies.allergenString}`;

    // Combine the nutrition data with the ingredients string
    const result = {
      ...nutrition,
      ingredients: fullIngredientsString,
    };

    console.log("Complete Analysis:", result);
    return result;
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

// getNutritionOnly();
getAllergiesOnly();
// getFullAnalysis();

// logout();
