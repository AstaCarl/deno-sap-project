import { AllergyService } from "./services/allergy-service.ts";
import { login, logout } from "./auth/auth.ts";
import { SessionService } from "./auth/session-service.ts";
import { IngredientsService } from "./services/ingredients-service.ts";
import { NutritionService } from "./services/nutrition-service.ts";
import { ProductService } from "./services/products-service.ts";

// check if session is valid

const productPath = "?$select=TreeCode,ProductDescription,ProductTreeLines";
const itemPath =
  "$select=ItemCode,ItemName,TreeType,U_CCF_Type,U_BOYX_Energi,U_BOYX_Energik,U_BOYX_fedt,U_BOYX_fedtsyre,U_BOYX_Kulhydrat,U_BOYX_sukkerarter,U_BOYX_Protein,U_BOYX_salt,U_CCF_Ingrediens_DA";

const main = async () => {
  // Check if the session is valid
  try {
    const sessionValid = await SessionService.isSessionValid();

    if (!sessionValid) {
      console.log("Session is not valid. Please log in again.");
      await login();
    }
    const sessionId = await SessionService.getSession();

    if (!sessionId) {
      throw new Error("No session ID found.");
    }

    // const fullProductTree = await ProductService.getFullProductTree(productPath, itemPath)
    // console.log('product tree', fullProductTree)

    const rawMaterialsOnly = await ProductService.getRawMaterials(productPath, itemPath);
    // console.log('raw materials', rawMaterialsOnly)

    const rawMaterialsWithAllergies =
      await ProductService.getRawMaterialsWithAllergies(productPath, itemPath);
    // console.log('raw materials with allergies', rawMaterialsWithAllergies)

    const analyzeAllergies = await AllergyService.analyzeAllergies(
      rawMaterialsWithAllergies
    );
    // console.log("allergy analysis", analyzeAllergies);

    const ingredients = await IngredientsService.getIngredients(
      rawMaterialsWithAllergies
    );

    const nutrition = NutritionService.calculateNutrition(
      rawMaterialsWithAllergies
    );
    console.log("nutrition", nutrition);

    const fullIngredientsString = `${ingredients} ${analyzeAllergies.allergenString}`;

    console.log("Dark Marci Complete Analysis:", {
      ...nutrition,
      ingredients: fullIngredientsString, // Combined string here
    });
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

// logout();

main();
