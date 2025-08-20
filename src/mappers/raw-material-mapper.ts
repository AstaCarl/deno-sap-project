import { AllergenStatus, Allergies, RawMaterial } from "../types.ts";

// mapper class to convert raw data into objects of type RawMaterial
export class RawMaterialMapper {

  // Parses a string value to a number, replacing commas with dots for decimal conversion
  private static parseNumber(value: string | undefined): number {
    return parseFloat(value?.replace(",", ".") || "0");
  }

  // Maps a single item to a RaWMaterial object
  static mapMultiple(
    items: any[],
    includeAllergies: boolean = false // Whether to include allergies in the mapping
  ): RawMaterial[] {
    return items.map((item) => {
      const rawMaterial: RawMaterial = {
        itemCode: item.ItemCode,
        itemName: item.ItemName,
        quantityKg: item.quantity,
        // parentItemCode: item.ParentItem,
        fat: this.parseNumber(item.U_BOYX_fedt),
        protein: this.parseNumber(item.U_BOYX_Protein),
        carbohydrates: this.parseNumber(item.U_BOYX_Kulhydrat),
        salt: this.parseNumber(item.U_BOYX_salt),
        sugars: this.parseNumber(item.U_BOYX_sukkerarter),
        energyKJ: this.parseNumber(item.U_BOYX_Energi),
        energyKcal: this.parseNumber(item.U_BOYX_Energik),
        fattyAcids: this.parseNumber(item.U_BOYX_fedtsyre),
        ingredientsDescription: item.U_CCF_Ingrediens_DA,
      };
      // Add allergies if requested
      if (includeAllergies) {
        rawMaterial.allergies = this.mapAllergies(item);
      }

      return rawMaterial;
    });
  }
  // Maps allergies from the item object to the Allergies type
  private static mapAllergies(item: any): Allergies {
    return {
      gluten: item.U_BOYX_gluten || AllergenStatus.FreeFrom,
      crustaceans: item.U_BOYX_Krebsdyr || AllergenStatus.FreeFrom,
      eggs: item.U_BOYX_aag || AllergenStatus.FreeFrom,
      fish: item.U_BOYX_fisk || AllergenStatus.FreeFrom,
      peanuts: item.U_BOYX_JN || AllergenStatus.FreeFrom,
      soy: item.U_BOYX_soja || AllergenStatus.FreeFrom,
      milk: item.U_BOYX_ML || AllergenStatus.FreeFrom,
      almonds: item.U_BOYX_mandel || AllergenStatus.FreeFrom,
      hazelnuts: item.U_BOYX_hassel || AllergenStatus.FreeFrom,
      walnuts: item.U_BOYX_val || AllergenStatus.FreeFrom,
      cashews: item.U_BOYX_Cashe || AllergenStatus.FreeFrom,
      pecans: item.U_BOYX_Pekan || AllergenStatus.FreeFrom,
      pistachios: item.U_BOYX_peka || AllergenStatus.FreeFrom,
      macadamias: item.U_BOYX_Queensland || AllergenStatus.FreeFrom,
      celery: item.U_BOYX_Selleri || AllergenStatus.FreeFrom,
      mustard: item.U_BOYX_Sennep || AllergenStatus.FreeFrom,
      sesame: item.U_BOYX_Sesam || AllergenStatus.FreeFrom,
      sulphurDioxide: item.U_BOYX_Svovldioxid || AllergenStatus.FreeFrom,
      lupin: item.U_BOYX_Lupin || AllergenStatus.FreeFrom,
      molluscs: item.U_BOYX_BL || AllergenStatus.FreeFrom,
    };
  }
}
