import { ProductApi } from "../api/product-api.ts";
import { RawMaterialMapper } from "../mappers/raw-material-mapper.ts";
import { RawMaterial } from "../types.ts";

export class ProductService {
  static readonly ALLOWED_TYPES = ["Råvare", "Færdigvare", "HF"];

  static async getFullProductTree(productTreePath: string, itemPath: string) {
    const ingredientsCache = new Map(); // Cache items by ItemCode

    const treeCode = Deno.env.get("TREE_CODE") ?? "";

    // Fetch the root product tree, top level product
    const rootTree = await ProductApi.getProductTree(treeCode, productTreePath);
    const rootTreeLines = rootTree["ProductTreeLines"];

    // Initialze the stack and add the root tree lines with their quantities to the stack
    const processingStack = rootTreeLines.map((treeLine: any) => ({
      ...treeLine,
      cumulativeQuantity: treeLine.Quantity,
    }));

    // Process the stack until it's empty, (while there are producttrees to process)
    while (processingStack.length > 0) {
      const currentTreeLine = processingStack.pop(); // Takes the last item from the stack

      if (!currentTreeLine.ItemCode) continue; // Skip if no item code is present

      // Fetch item details for the current item code of the tree(the one that was popped from the stack)
      try {
        const itemDetails = await ProductApi.getItem(
          currentTreeLine.ItemCode,
          itemPath
        );

        // Ignore items that are not of allowed types
        if (!this.ALLOWED_TYPES.includes(itemDetails.U_CCF_Type)) continue;

        // If the item that was fetched is a production tree (has sub-trees), fetch its sub-tree
        if (itemDetails.TreeType === "iProductionTree") {
          // Fetch the sub-tree for the current item code
          const subTree = await ProductApi.getProductTree(
            currentTreeLine.ItemCode,
            productTreePath
          );

          // Find the sub-tree lines for each of the sub-trees
          const subTreeLines = subTree["ProductTreeLines"].map(
            // Create an object for each sub-tree line, including the calculated cumulative quantity
            (subTreeLine: any) => ({
              ...subTreeLine,
              cumulativeQuantity:
                currentTreeLine.cumulativeQuantity * subTreeLine.Quantity,
            })
          );

          // Push the sub-tree lines to the processing stack
          processingStack.push(...subTreeLines);
        }

        // // check if item already exists in cache

        // If item is already in the ingrdientslist, update quantities
        if (ingredientsCache.has(currentTreeLine.ItemCode)) {
          const cachedItem = ingredientsCache.get(currentTreeLine.ItemCode); // Get the cached ingredient

          // Update the cached ingredient's quantity and original quantity
          cachedItem.quantity += currentTreeLine.cumulativeQuantity;
          cachedItem.originalQuantity += currentTreeLine.Quantity;
        }
        // If item is not in cache → add it to the cache
        else {
          ingredientsCache.set(currentTreeLine.ItemCode, {
            ...itemDetails,
            quantity: currentTreeLine.cumulativeQuantity,
            originalQuantity: currentTreeLine.Quantity,
          });
        }
      } catch {
        console.error(`Failed to fetch item (${currentTreeLine.ItemCode}):`);
      }
    }
    // Convert Map to Array
    const finalIngredientsList = Array.from(ingredientsCache.values());
    console.log("Final ingredients list:", finalIngredientsList);
    return finalIngredientsList;
  }

  static async getRawMaterials(
    productPath: string,
    itemPath: string
  ): Promise<RawMaterial[]> {
    const fullProductTree = await this.getFullProductTree(
      productPath,
      itemPath
    );
    const rawMaterialsOnly = fullProductTree.filter(
      (item) => item.U_CCF_Type === "Råvare"
    );
    return RawMaterialMapper.mapMultiple(rawMaterialsOnly, false);
  }

  static async getRawMaterialsWithAllergies(
    productPath: string,
    itemPath: string
  ): Promise<RawMaterial[]> {
    const fullProductTree = await this.getFullProductTree(
      productPath,
      itemPath
    );
    const rawMaterialsOnly = fullProductTree.filter(
      (item) => item.U_CCF_Type === "Råvare"
    );
    return RawMaterialMapper.mapMultiple(rawMaterialsOnly, true);
  }
}
