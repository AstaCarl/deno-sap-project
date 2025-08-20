import { SapApi } from "../api/api.ts";


// ProductApi class to handle product-related API requests
export class ProductApi {

    // Fetches the product tree for a given product path and tree code
  static getProductTree(treeCode: string, productPath?: string) {
    return SapApi.get(`ProductTrees('${treeCode}')${productPath ? productPath : '' }`);
  }

  // Fetches item details for a given item code and item path
  static getItem(itemCode: string, itemPath: string) {
    return SapApi.get(`/Items('${itemCode}')${itemPath}`);
  }
}