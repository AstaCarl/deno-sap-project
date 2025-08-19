interface UserCredentials {
  CompanyDB: string;
  UserName: string;
  Password: string;
}

interface IngredientWithPercentage {
  itemName: string;
  itemCode: string;
  description: string;
  quantityKg: number;
  percentage: number;
}

interface Nutrition {
  fat: number;
  protein: number;
  carbohydrates: number;
  salt: number;
  sugars: number;
  energyKJ: number;
  energyKcal: number;
  fattyAcids: number;
  allergiesInFullProduct?: Allergies; // Optional, if not always present
}

interface RawMaterial {
  itemCode: string;
  itemName: string;
  quantityKg: number;
  fat: number;
  protein: number;
  carbohydrates: number;
  salt: number;
  sugars: number;
  energyKJ: number;
  energyKcal: number;
  fattyAcids: number;
  ingredientsDescription?: string; // Optional, if not always present
  U_CCF_Ingrediens_DA?: string;
  allergies?: Allergies;
}

enum AllergenStatus {
  FreeFrom = "Free from",
  InProduct = "In product",
  MayContainTracesOf = "May contain traces of",
}

interface Allergies {
  gluten: AllergenStatus;
  crustaceans: AllergenStatus; // krebsdyr
  eggs: AllergenStatus; // aag
  fish: AllergenStatus;
  peanuts: AllergenStatus; // jn (jordnødder)
  soy: AllergenStatus; // soja
  milk: AllergenStatus; // ml (mælk)
  almonds: AllergenStatus; // mandel
  hazelnuts: AllergenStatus; // hassel
  walnuts: AllergenStatus; // val
  cashews: AllergenStatus; // cashe
  pecans: AllergenStatus; // pekan
  pistachios: AllergenStatus; // pistacie
  macadamias: AllergenStatus; // queensland
  celery: AllergenStatus; // selleri
  mustard: AllergenStatus; // sennep
  sesame: AllergenStatus;
  sulphurDioxide: AllergenStatus; // svovldioxid
  lupin: AllergenStatus;
  molluscs: AllergenStatus; // bl (bløddyr)
}
export type {
  UserCredentials,
  RawMaterial,
  Nutrition,
  Allergies,
  IngredientWithPercentage,
};
export { AllergenStatus };
