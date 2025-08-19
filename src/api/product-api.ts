import { SapApi } from "../api/api.ts";

export class ProductApi {

  static getProductTree(treeCode: string, productPath?: string) {
    return SapApi.get(`ProductTrees('${treeCode}')${productPath ? productPath : '' }`);
  }

  static getItem(itemCode: string, itemPath: string) {
    return SapApi.get(`/Items('${itemCode}')${itemPath}`);
  }
}