import { ProductApi } from "../api/product-api.ts";
import { RawMaterialMapper } from "../mappers/raw-material-mapper.ts";
import { RawMaterial } from "../types.ts";

export class ProductService {
  static readonly ALLOWED_TYPES = ["Råvare", "Færdigvare", "HF"];

  // Fetches the full product tree for a given product path and item path
  // Returns an array of items with their details
  static async getFullProductTree(productPath: string, itemPath: string) {
    const fullProductTree = [];

    const rootTree = await ProductApi.getProductTree(
      Deno.env.get("TREE_CODE") ?? "",
      productPath
    );
    console.log('env tree code', Deno.env.get("TREE_CODE"));

    const stack = [...rootTree["ProductTreeLines"]];

    while (stack.length > 0) {
      const currentTreeLine = stack.pop();

      if (!currentTreeLine.ItemCode) continue;

      try {
        const item = await ProductApi.getItem(
          currentTreeLine.ItemCode,
          itemPath
        );

        // Ignore items that are not of allowed types
        if (!this.ALLOWED_TYPES.includes(item.U_CCF_Type)) continue;

        // If the item is a production tree, fetch its sub-tree
        if (item.TreeType === "iProductionTree") {
          const itemTree = await ProductApi.getProductTree(
            currentTreeLine.ItemCode,
            productPath
          );
          stack.push(...itemTree["ProductTreeLines"]); // Add sub-tree lines to the stack
        }

        fullProductTree.push({ ...item, quantity: currentTreeLine.Quantity }); // Add item with its quantity to the result
      } catch (_error) {
        console.error(`Failed to fetch item (${currentTreeLine.ItemCode})`);
      }
    }

    return fullProductTree; // Return the complete product tree
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
