// keywordMappings.js 
// Auto-generated from category JSON + API Fallback
import axios from "axios";

const keywordMappings = {
  // ================== BOOKS ==================
  book: { category: "Books" },
  books: { category: "Books" },
  fiction: { category: "Books", subCategory: "Fiction" },
  thriller: { category: "Books", subCategory: "Fiction", subSubCategory: "Thriller" },
  thrillers: { category: "Books", subCategory: "Fiction", subSubCategory: "Thriller" },
  romance: { category: "Books", subCategory: "Fiction", subSubCategory: "Romance" },
  romances: { category: "Books", subCategory: "Fiction", subSubCategory: "Romance" },
  fantasy: { category: "Books", subCategory: "Fiction", subSubCategory: "Fantasy" },
  fantasies: { category: "Books", subCategory: "Fiction", subSubCategory: "Fantasy" },
  "science fiction": { category: "Books", subCategory: "Fiction", subSubCategory: "Science Fiction" },
  scifi: { category: "Books", subCategory: "Fiction", subSubCategory: "Science Fiction" },

  nonfiction: { category: "Books", subCategory: "Non-Fiction" },
  "non fiction": { category: "Books", subCategory: "Non-Fiction" },
  biography: { category: "Books", subCategory: "Non-Fiction", subSubCategory: "Biography" },
  biographies: { category: "Books", subCategory: "Non-Fiction", subSubCategory: "Biography" },
  "self help": { category: "Books", subCategory: "Non-Fiction", subSubCategory: "Self-Help" },
  selfhelp: { category: "Books", subCategory: "Non-Fiction", subSubCategory: "Self-Help" },
  history: { category: "Books", subCategory: "Non-Fiction", subSubCategory: "History" },
  histories: { category: "Books", subCategory: "Non-Fiction", subSubCategory: "History" },
  philosophy: { category: "Books", subCategory: "Non-Fiction", subSubCategory: "Philosophy" },
  philosophies: { category: "Books", subCategory: "Non-Fiction", subSubCategory: "Philosophy" },

  academic: { category: "Books", subCategory: "Academic" },
  academics: { category: "Books", subCategory: "Academic" },
  engineering: { category: "Books", subCategory: "Academic", subSubCategory: "Engineering" },
  medical: { category: "Books", subCategory: "Academic", subSubCategory: "Medical" },
  law: { category: "Books", subCategory: "Academic", subSubCategory: "Law" },
  science: { category: "Books", subCategory: "Academic", subSubCategory: "Science" },
  sciences: { category: "Books", subCategory: "Academic", subSubCategory: "Science" },

  comics: { category: "Books", subCategory: "Comics" },
  comic: { category: "Books", subCategory: "Comics" },
  manga: { category: "Books", subCategory: "Comics", subSubCategory: "Manga" },
  mangas: { category: "Books", subCategory: "Comics", subSubCategory: "Manga" },
  superhero: { category: "Books", subCategory: "Comics", subSubCategory: "Superhero" },
  superheroes: { category: "Books", subCategory: "Comics", subSubCategory: "Superhero" },
  "graphic novels": { category: "Books", subCategory: "Comics", subSubCategory: "Graphic Novels" },
  "graphic novel": { category: "Books", subCategory: "Comics", subSubCategory: "Graphic Novels" },

  // ================== ELECTRONICS ==================
  electronics: { category: "Electronics" },
  electronic: { category: "Electronics" },
  mobile: { category: "Electronics", subCategory: "Mobiles" },
  mobiles: { category: "Electronics", subCategory: "Mobiles" },
  phone: { category: "Electronics", subCategory: "Mobiles" },
  phones: { category: "Electronics", subCategory: "Mobiles" },
  smartphone: { category: "Electronics", subCategory: "Mobiles", subSubCategory: "Smartphones" },
  smartphones: { category: "Electronics", subCategory: "Mobiles", subSubCategory: "Smartphones" },
  "feature phone": { category: "Electronics", subCategory: "Mobiles", subSubCategory: "Feature Phones" },
  "feature phones": { category: "Electronics", subCategory: "Mobiles", subSubCategory: "Feature Phones" },
  "mobile accessory": { category: "Electronics", subCategory: "Mobiles", subSubCategory: "Accessories" },
  "mobile accessories": { category: "Electronics", subCategory: "Mobiles", subSubCategory: "Accessories" },

  laptop: { category: "Electronics", subCategory: "Laptops" },
  laptops: { category: "Electronics", subCategory: "Laptops" },
  "gaming laptop": { category: "Electronics", subCategory: "Laptops", subSubCategory: "Gaming Laptops" },
  "gaming laptops": { category: "Electronics", subCategory: "Laptops", subSubCategory: "Gaming Laptops" },
  "business laptop": { category: "Electronics", subCategory: "Laptops", subSubCategory: "Business Laptops" },
  "business laptops": { category: "Electronics", subCategory: "Laptops", subSubCategory: "Business Laptops" },
  ultrabook: { category: "Electronics", subCategory: "Laptops", subSubCategory: "Ultrabooks" },
  ultrabooks: { category: "Electronics", subCategory: "Laptops", subSubCategory: "Ultrabooks" },

  tablet: { category: "Electronics", subCategory: "Tablets" },
  tablets: { category: "Electronics", subCategory: "Tablets" },
  tab: { category: "Electronics", subCategory: "Tablets" },
  tabs: { category: "Electronics", subCategory: "Tablets" },
  android: { category: "Electronics", subCategory: "Tablets", subSubCategory: "Android" },
  ipad: { category: "Electronics", subCategory: "Tablets", subSubCategory: "iPads" },
  ipads: { category: "Electronics", subCategory: "Tablets", subSubCategory: "iPads" },
  "windows tablet": { category: "Electronics", subCategory: "Tablets", subSubCategory: "Windows Tablets" },
  "windows tablets": { category: "Electronics", subCategory: "Tablets", subSubCategory: "Windows Tablets" },

  headphone: { category: "Electronics", subCategory: "Headphones" },
  headphones: { category: "Electronics", subCategory: "Headphones" },
  headset: { category: "Electronics", subCategory: "Headphones" },
  headsets: { category: "Electronics", subCategory: "Headphones" },
  earphone: { category: "Electronics", subCategory: "Headphones" },
  earphones: { category: "Electronics", subCategory: "Headphones" },
  wired: { category: "Electronics", subCategory: "Headphones", subSubCategory: "Wired" },
  wireless: { category: "Electronics", subCategory: "Headphones", subSubCategory: "Wireless" },
  "noise cancelling": { category: "Electronics", subCategory: "Headphones", subSubCategory: "Noise Cancelling" },
  "noise canceling": { category: "Electronics", subCategory: "Headphones", subSubCategory: "Noise Cancelling" },

  camera: { category: "Electronics", subCategory: "Cameras" },
  cameras: { category: "Electronics", subCategory: "Cameras" },
  dslr: { category: "Electronics", subCategory: "Cameras", subSubCategory: "DSLR" },
  dslrs: { category: "Electronics", subCategory: "Cameras", subSubCategory: "DSLR" },
  mirrorless: { category: "Electronics", subCategory: "Cameras", subSubCategory: "Mirrorless" },
  "action camera": { category: "Electronics", subCategory: "Cameras", subSubCategory: "Action Cameras" },
  "action cameras": { category: "Electronics", subCategory: "Cameras", subSubCategory: "Action Cameras" },

  // ================== ACCESSORIES ==================
  accessories: { category: "Accessories" },
  accessory: { category: "Accessories" },
  watch: { category: "Accessories", subCategory: "Watches" },
  watches: { category: "Accessories", subCategory: "Watches" },
  smartwatch: { category: "Accessories", subCategory: "Watches", subSubCategory: "Smartwatches" },
  smartwatches: { category: "Accessories", subCategory: "Watches", subSubCategory: "Smartwatches" },
  analog: { category: "Accessories", subCategory: "Watches", subSubCategory: "Analog" },
  digital: { category: "Accessories", subCategory: "Watches", subSubCategory: "Digital" },

  bag: { category: "Accessories", subCategory: "Bags" },
  bags: { category: "Accessories", subCategory: "Bags" },
  backpack: { category: "Accessories", subCategory: "Bags", subSubCategory: "Backpacks" },
  backpacks: { category: "Accessories", subCategory: "Bags", subSubCategory: "Backpacks" },
  handbag: { category: "Accessories", subCategory: "Bags", subSubCategory: "Handbags" },
  handbags: { category: "Accessories", subCategory: "Bags", subSubCategory: "Handbags" },
  "travel bag": { category: "Accessories", subCategory: "Bags", subSubCategory: "Travel Bags" },
  "travel bags": { category: "Accessories", subCategory: "Bags", subSubCategory: "Travel Bags" },

  jewelry: { category: "Accessories", subCategory: "Jewelry" },
  jewellery: { category: "Accessories", subCategory: "Jewelry" },
  necklace: { category: "Accessories", subCategory: "Jewelry", subSubCategory: "Necklaces" },
  necklaces: { category: "Accessories", subCategory: "Jewelry", subSubCategory: "Necklaces" },
  earring: { category: "Accessories", subCategory: "Jewelry", subSubCategory: "Earrings" },
  earrings: { category: "Accessories", subCategory: "Jewelry", subSubCategory: "Earrings" },
  bracelet: { category: "Accessories", subCategory: "Jewelry", subSubCategory: "Bracelets" },
  bracelets: { category: "Accessories", subCategory: "Jewelry", subSubCategory: "Bracelets" },
  ring: { category: "Accessories", subCategory: "Jewelry", subSubCategory: "Rings" },
  rings: { category: "Accessories", subCategory: "Jewelry", subSubCategory: "Rings" },

  belt: { category: "Accessories", subCategory: "Belts" },
  belts: { category: "Accessories", subCategory: "Belts" },
  "leather belt": { category: "Accessories", subCategory: "Belts", subSubCategory: "Leather Belts" },
  "leather belts": { category: "Accessories", subCategory: "Belts", subSubCategory: "Leather Belts" },
  "fabric belt": { category: "Accessories", subCategory: "Belts", subSubCategory: "Fabric Belts" },
  "fabric belts": { category: "Accessories", subCategory: "Belts", subSubCategory: "Fabric Belts" },

  // ================== CLOTHING ==================
  clothing: { category: "Clothing" },
  clothes: { category: "Clothing" },
  apparel: { category: "Clothing" },

  // Men's Clothing
  mens: { category: "Clothing", subCategory: "Men" },
  men: { category: "Clothing", subCategory: "Men" },
  shirt: { category: "Clothing", subCategory: "Men", subSubCategory: "Shirts" },
  shirts: { category: "Clothing", subCategory: "Men", subSubCategory: "Shirts" },
  tshirt: { category: "Clothing", subCategory: "Men", subSubCategory: "T-Shirts" },
  tshirts: { category: "Clothing", subCategory: "Men", subSubCategory: "T-Shirts" },
  "t shirt": { category: "Clothing", subCategory: "Men", subSubCategory: "T-Shirts" },
  "t shirts": { category: "Clothing", subCategory: "Men", subSubCategory: "T-Shirts" },
  tee: { category: "Clothing", subCategory: "Men", subSubCategory: "T-Shirts" },
  tees: { category: "Clothing", subCategory: "Men", subSubCategory: "T-Shirts" },
  jeans: { category: "Clothing", subCategory: "Men", subSubCategory: "Jeans" },
  jean: { category: "Clothing", subCategory: "Men", subSubCategory: "Jeans" },
  jacket: { category: "Clothing", subCategory: "Men", subSubCategory: "Jackets" },
  jackets: { category: "Clothing", subCategory: "Men", subSubCategory: "Jackets" },
  pant: { category: "Clothing", subCategory: "Men", subSubCategory: "Pants" },
  pants: { category: "Clothing", subCategory: "Men", subSubCategory: "Pants" },
  trouser: { category: "Clothing", subCategory: "Men", subSubCategory: "Pants" },
  trousers: { category: "Clothing", subCategory: "Men", subSubCategory: "Pants" },
  hoodie: { category: "Clothing", subCategory: "Men", subSubCategory: "Hoodies" },
  hoodies: { category: "Clothing", subCategory: "Men", subSubCategory: "Hoodies" },
  tracksuit: { category: "Clothing", subCategory: "Men", subSubCategory: "Tracksuits" },
  tracksuits: { category: "Clothing", subCategory: "Men", subSubCategory: "Tracksuits" },
  "casual wear": { category: "Clothing", subCategory: "Men", subSubCategory: "Casual Wear" },
  "casual clothing": { category: "Clothing", subCategory: "Men", subSubCategory: "Casual Wear" },
  suit: { category: "Clothing", subCategory: "Men", subSubCategory: "Suits" },
  suits: { category: "Clothing", subCategory: "Men", subSubCategory: "Suits" },
  sweater: { category: "Clothing", subCategory: "Men", subSubCategory: "Sweaters" },
  sweaters: { category: "Clothing", subCategory: "Men", subSubCategory: "Sweaters" },

  // Women's Clothing
  womens: { category: "Clothing", subCategory: "Women" },
  women: { category: "Clothing", subCategory: "Women" },
  dress: { category: "Clothing", subCategory: "Women", subSubCategory: "Dresses" },
  dresses: { category: "Clothing", subCategory: "Women", subSubCategory: "Dresses" },
  top: { category: "Clothing", subCategory: "Women", subSubCategory: "Tops" },
  tops: { category: "Clothing", subCategory: "Women", subSubCategory: "Tops" },
  skirt: { category: "Clothing", subCategory: "Women", subSubCategory: "Skirts" },
  skirts: { category: "Clothing", subCategory: "Women", subSubCategory: "Skirts" },
  saree: { category: "Clothing", subCategory: "Women", subSubCategory: "Sarees" },
  sarees: { category: "Clothing", subCategory: "Women", subSubCategory: "Sarees" },
  "women hoodie": { category: "Clothing", subCategory: "Women", subSubCategory: "Hoodies" },
  "women hoodies": { category: "Clothing", subCategory: "Women", subSubCategory: "Hoodies" },
  blouse: { category: "Clothing", subCategory: "Women", subSubCategory: "Blouses" },
  blouses: { category: "Clothing", subCategory: "Women", subSubCategory: "Blouses" },
  leggings: { category: "Clothing", subCategory: "Women", subSubCategory: "Leggings" },
  legging: { category: "Clothing", subCategory: "Women", subSubCategory: "Leggings" },

  // Kids' Clothing
  kids: { category: "Clothing", subCategory: "Kids" },
  kid: { category: "Clothing", subCategory: "Kids" },
  children: { category: "Clothing", subCategory: "Kids" },
  "boys clothing": { category: "Clothing", subCategory: "Kids", subSubCategory: "Boys Clothing" },
  "boy clothing": { category: "Clothing", subCategory: "Kids", subSubCategory: "Boys Clothing" },
  "girls clothing": { category: "Clothing", subCategory: "Kids", subSubCategory: "Girls Clothing" },
  "girl clothing": { category: "Clothing", subCategory: "Kids", subSubCategory: "Girls Clothing" },
  "baby clothing": { category: "Clothing", subCategory: "Kids", subSubCategory: "Baby Clothing" },
  "infant clothing": { category: "Clothing", subCategory: "Kids", subSubCategory: "Baby Clothing" },

  // ================== FOOTWEAR ==================
  footwear: { category: "Footwear" },
  shoes: { category: "Footwear" },
  shoe: { category: "Footwear" },

  // Men's Footwear
  "mens footwear": { category: "Footwear", subCategory: "Men" },
  "men footwear": { category: "Footwear", subCategory: "Men" },
  "formal shoes": { category: "Footwear", subCategory: "Men", subSubCategory: "Formal Shoes" },
  "formal shoe": { category: "Footwear", subCategory: "Men", subSubCategory: "Formal Shoes" },
  "casual shoes": { category: "Footwear", subCategory: "Men", subSubCategory: "Casual Shoes" },
  "casual shoe": { category: "Footwear", subCategory: "Men", subSubCategory: "Casual Shoes" },
  "sports shoes": { category: "Footwear", subCategory: "Men", subSubCategory: "Sports Shoes" },
  "sports shoe": { category: "Footwear", subCategory: "Men", subSubCategory: "Sports Shoes" },
  sneakers: { category: "Footwear", subCategory: "Men", subSubCategory: "Sports Shoes" },
  sneaker: { category: "Footwear", subCategory: "Men", subSubCategory: "Sports Shoes" },
  boot: { category: "Footwear", subCategory: "Men", subSubCategory: "Boots" },
  boots: { category: "Footwear", subCategory: "Men", subSubCategory: "Boots" },
  loafer: { category: "Footwear", subCategory: "Men", subSubCategory: "Loafers" },
  loafers: { category: "Footwear", subCategory: "Men", subSubCategory: "Loafers" },

  // Women's Footwear
  "womens footwear": { category: "Footwear", subCategory: "Women" },
  "women footwear": { category: "Footwear", subCategory: "Women" },
  heels: { category: "Footwear", subCategory: "Women", subSubCategory: "Heels" },
  heel: { category: "Footwear", subCategory: "Women", subSubCategory: "Heels" },
  flats: { category: "Footwear", subCategory: "Women", subSubCategory: "Flats" },
  flat: { category: "Footwear", subCategory: "Women", subSubCategory: "Flats" },
  sandals: { category: "Footwear", subCategory: "Women", subSubCategory: "Sandals" },
  sandal: { category: "Footwear", subCategory: "Women", subSubCategory: "Sandals" },
  "women sneakers": { category: "Footwear", subCategory: "Women", subSubCategory: "Sneakers" },
  "women sneaker": { category: "Footwear", subCategory: "Women", subSubCategory: "Sneakers" },
  "women boot": { category: "Footwear", subCategory: "Women", subSubCategory: "Boots" },
  "women boots": { category: "Footwear", subCategory: "Women", subSubCategory: "Boots" },

  // Kids' Footwear
  "kids footwear": { category: "Footwear", subCategory: "Kids" },
  "kid footwear": { category: "Footwear", subCategory: "Kids" },
  "children footwear": { category: "Footwear", subCategory: "Kids" },
  "school shoes": { category: "Footwear", subCategory: "Kids", subSubCategory: "School Shoes" },
  "school shoe": { category: "Footwear", subCategory: "Kids", subSubCategory: "School Shoes" },
  "kids sports shoes": { category: "Footwear", subCategory: "Kids", subSubCategory: "Sports Shoes" },
  "kids sports shoe": { category: "Footwear", subCategory: "Kids", subSubCategory: "Sports Shoes" },
  "kids casual shoes": { category: "Footwear", subCategory: "Kids", subSubCategory: "Casual Shoes" },
  "kids casual shoe": { category: "Footwear", subCategory: "Kids", subSubCategory: "Casual Shoes" },
  "kids sandals": { category: "Footwear", subCategory: "Kids", subSubCategory: "Sandals" },
  "kids sandal": { category: "Footwear", subCategory: "Kids", subSubCategory: "Sandals" },

  // ================== HOME ==================
  home: { category: "Home" },
  household: { category: "Home" },

  // Furniture
  furniture: { category: "Home", subCategory: "Furniture" },
  sofa: { category: "Home", subCategory: "Furniture", subSubCategory: "Sofas" },
  sofas: { category: "Home", subCategory: "Furniture", subSubCategory: "Sofas" },
  couch: { category: "Home", subCategory: "Furniture", subSubCategory: "Sofas" },
  couches: { category: "Home", subCategory: "Furniture", subSubCategory: "Sofas" },
  bed: { category: "Home", subCategory: "Furniture", subSubCategory: "Beds" },
  beds: { category: "Home", subCategory: "Furniture", subSubCategory: "Beds" },
  table: { category: "Home", subCategory: "Furniture", subSubCategory: "Tables" },
  tables: { category: "Home", subCategory: "Furniture", subSubCategory: "Tables" },
  chair: { category: "Home", subCategory: "Furniture", subSubCategory: "Chairs" },
  chairs: { category: "Home", subCategory: "Furniture", subSubCategory: "Chairs" },
  wardrobe: { category: "Home", subCategory: "Furniture", subSubCategory: "Wardrobes" },
  wardrobes: { category: "Home", subCategory: "Furniture", subSubCategory: "Wardrobes" },
  "wall art": { category: "Home", subCategory: "Furniture", subSubCategory: "Wall Art" },
  "wall decor": { category: "Home", subCategory: "Furniture", subSubCategory: "Wall Art" },

  // Home Decor
  decor: { category: "Home", subCategory: "Home Decor" },
  decoration: { category: "Home", subCategory: "Home Decor" },
  decorations: { category: "Home", subCategory: "Home Decor" },
  curtain: { category: "Home", subCategory: "Home Decor", subSubCategory: "Curtains" },
  curtains: { category: "Home", subCategory: "Home Decor", subSubCategory: "Curtains" },
  rug: { category: "Home", subCategory: "Home Decor", subSubCategory: "Rugs" },
  rugs: { category: "Home", subCategory: "Home Decor", subSubCategory: "Rugs" },
  carpet: { category: "Home", subCategory: "Home Decor", subSubCategory: "Rugs" },
  carpets: { category: "Home", subCategory: "Home Decor", subSubCategory: "Rugs" },
  lighting: { category: "Home", subCategory: "Home Decor", subSubCategory: "Lighting" },
  lights: { category: "Home", subCategory: "Home Decor", subSubCategory: "Lighting" },
  lamp: { category: "Home", subCategory: "Home Decor", subSubCategory: "Lighting" },
  lamps: { category: "Home", subCategory: "Home Decor", subSubCategory: "Lighting" },
  clock: { category: "Home", subCategory: "Home Decor", subSubCategory: "Clocks" },
  clocks: { category: "Home", subCategory: "Home Decor", subSubCategory: "Clocks" },

  // Appliances
  appliances: { category: "Home", subCategory: "Appliances" },
  appliance: { category: "Home", subCategory: "Appliances" },
  refrigerator: { category: "Home", subCategory: "Appliances", subSubCategory: "Refrigerators" },
  refrigerators: { category: "Home", subCategory: "Appliances", subSubCategory: "Refrigerators" },
  fridge: { category: "Home", subCategory: "Appliances", subSubCategory: "Refrigerators" },
  fridges: { category: "Home", subCategory: "Appliances", subSubCategory: "Refrigerators" },
  "washing machine": { category: "Home", subCategory: "Appliances", subSubCategory: "Washing Machines" },
  "washing machines": { category: "Home", subCategory: "Appliances", subSubCategory: "Washing Machines" },
  washer: { category: "Home", subCategory: "Appliances", subSubCategory: "Washing Machines" },
  washers: { category: "Home", subCategory: "Appliances", subSubCategory: "Washing Machines" },
  "air conditioner": { category: "Home", subCategory: "Appliances", subSubCategory: "Air Conditioners" },
  "air conditioners": { category: "Home", subCategory: "Appliances", subSubCategory: "Air Conditioners" },
  ac: { category: "Home", subCategory: "Appliances", subSubCategory: "Air Conditioners" },
  "microwave oven": { category: "Home", subCategory: "Appliances", subSubCategory: "Microwave Ovens" },
  "microwave ovens": { category: "Home", subCategory: "Appliances", subSubCategory: "Microwave Ovens" },
  microwave: { category: "Home", subCategory: "Appliances", subSubCategory: "Microwave Ovens" },
  microwaves: { category: "Home", subCategory: "Appliances", subSubCategory: "Microwave Ovens" },
  "iron box": { category: "Home", subCategory: "Appliances", subSubCategory: "Iron Box" },
  "iron boxes": { category: "Home", subCategory: "Appliances", subSubCategory: "Iron Box" },
  iron: { category: "Home", subCategory: "Appliances", subSubCategory: "Iron Box" },
  irons: { category: "Home", subCategory: "Appliances", subSubCategory: "Iron Box" },

  // ================== BEAUTY ==================
  beauty: { category: "Beauty" },
  cosmetic: { category: "Beauty" },
  cosmetics: { category: "Beauty" },

  // Makeup
  makeup: { category: "Beauty", subCategory: "Makeup" },
  "make up": { category: "Beauty", subCategory: "Makeup" },
  lipstick: { category: "Beauty", subCategory: "Makeup", subSubCategory: "Lipstick" },
  lipsticks: { category: "Beauty", subCategory: "Makeup", subSubCategory: "Lipstick" },
  foundation: { category: "Beauty", subCategory: "Makeup", subSubCategory: "Foundation" },
  foundations: { category: "Beauty", subCategory: "Makeup", subSubCategory: "Foundation" },
  eyeliner: { category: "Beauty", subCategory: "Makeup", subSubCategory: "Eyeliner" },
  eyeliners: { category: "Beauty", subCategory: "Makeup", subSubCategory: "Eyeliner" },
  mascara: { category: "Beauty", subCategory: "Makeup", subSubCategory: "Mascara" },
  mascaras: { category: "Beauty", subCategory: "Makeup", subSubCategory: "Mascara" },
  eyeshadow: { category: "Beauty", subCategory: "Makeup", subSubCategory: "Eyeshadow" },
  eyeshadows: { category: "Beauty", subCategory: "Makeup", subSubCategory: "Eyshadow" },

  // Skincare
  skincare: { category: "Beauty", subCategory: "Skincare" },
  "skin care": { category: "Beauty", subCategory: "Skincare" },
  moisturizer: { category: "Beauty", subCategory: "Skincare", subSubCategory: "Moisturizers" },
  moisturizers: { category: "Beauty", subCategory: "Skincare", subSubCategory: "Moisturizers" },
  cleanser: { category: "Beauty", subCategory: "Skincare", subSubCategory: "Cleansers" },
  cleansers: { category: "Beauty", subCategory: "Skincare", subSubCategory: "Cleansers" },
  "face mask": { category: "Beauty", subCategory: "Skincare", subSubCategory: "Face Masks" },
  "face masks": { category: "Beauty", subCategory: "Skincare", subSubCategory: "Face Masks" },
  serum: { category: "Beauty", subCategory: "Skincare", subSubCategory: "Serums" },
  serums: { category: "Beauty", subCategory: "Skincare", subSubCategory: "Serums" },
  toner: { category: "Beauty", subCategory: "Skincare", subSubCategory: "Toners" },
  toners: { category: "Beauty", subCategory: "Skincare", subSubCategory: "Toners" },

  // Haircare
  haircare: { category: "Beauty", subCategory: "Haircare" },
  "hair care": { category: "Beauty", subCategory: "Haircare" },
  shampoo: { category: "Beauty", subCategory: "Haircare", subSubCategory: "Shampoo" },
  shampoos: { category: "Beauty", subCategory: "Haircare", subSubCategory: "Shampoo" },
  conditioners: { category: "Beauty", subCategory: "Haircare", subSubCategory: "Conditioner" },
  conditioner: { category: "Beauty", subCategory: "Haircare", subSubCategory: "Conditioner" },
  "hair oil": { category: "Beauty", subCategory: "Haircare", subSubCategory: "Hair Oils" },
  "hair oils": { category: "Beauty", subCategory: "Haircare", subSubCategory: "Hair Oils" },
  "hair mask": { category: "Beauty", subCategory: "Haircare", subSubCategory: "Hair Masks" },
  "hair masks": { category: "Beauty", subCategory: "Haircare", subSubCategory: "Hair Masks" },
  "hair spray": { category: "Beauty", subCategory: "Haircare", subSubCategory: "Hair Sprays" },
  "hair sprays": { category: "Beauty", subCategory: "Haircare", subSubCategory: "Hair Sprays" },

  // ================== SPORTS ==================
  sports: { category: "Sports" },
  sport: { category: "Sports" },

  // Outdoor Sports
  "outdoor sports": { category: "Sports", subCategory: "Outdoor Sports" },
  outdoor: { category: "Sports", subCategory: "Outdoor Sports" },
  cricket: { category: "Sports", subCategory: "Outdoor Sports" },
  "cricket bat": { category: "Sports", subCategory: "Outdoor Sports", subSubCategory: "Cricket Bat" },
  "cricket bats": { category: "Sports", subCategory: "Outdoor Sports", subSubCategory: "Cricket Bat" },
  "cricket ball": { category: "Sports", subCategory: "Outdoor Sports", subSubCategory: "Cricket Ball" },
  "cricket balls": { category: "Sports", subCategory: "Outdoor Sports", subSubCategory: "Cricket Ball" },
  football: { category: "Sports", subCategory: "Outdoor Sports", subSubCategory: "Football" },
  "tennis bat": { category: "Sports", subCategory: "Outdoor Sports", subSubCategory: "Tennis Bat" },
  "tennis bats": { category: "Sports", subCategory: "Outdoor Sports", subSubCategory: "Tennis Bat" },
  "tennis ball": { category: "Sports", subCategory: "Outdoor Sports", subSubCategory: "Tennis Ball" },
  "tennis balls": { category: "Sports", subCategory: "Outdoor Sports", subSubCategory: "Tennis Ball" },
  badminton: { category: "Sports", subCategory: "Outdoor Sports", subSubCategory: "Badminton" },
  "badminton racket": { category: "Sports", subCategory: "Outdoor Sports", subSubCategory: "Badminton" },
  "badminton rackets": { category: "Sports", subCategory: "Outdoor Sports", subSubCategory: "Badminton" },
  basketball: { category: "Sports", subCategory: "Outdoor Sports", subSubCategory: "Basketball" },
  volleyball: { category: "Sports", subCategory: "Outdoor Sports", subSubCategory: "Volleyball" },

  // Indoor Sports
  "indoor sports": { category: "Sports", subCategory: "Indoor Sports" },
  indoor: { category: "Sports", subCategory: "Indoor Sports" },
  "table tennis": { category: "Sports", subCategory: "Indoor Sports", subSubCategory: "Table Tennis" },
  "ping pong": { category: "Sports", subCategory: "Indoor Sports", subSubCategory: "Table Tennis" },
  carrom: { category: "Sports", subCategory: "Indoor Sports", subSubCategory: "Carrom" },
  chess: { category: "Sports", subCategory: "Indoor Sports", subSubCategory: "Chess" },
  "board games": { category: "Sports", subCategory: "Indoor Sports", subSubCategory: "Board Games" },
  "board game": { category: "Sports", subCategory: "Indoor Sports", subSubCategory: "Board Games" },

  // Adventure Sports
  "adventure sports": { category: "Sports", subCategory: "Adventure Sports" },
  adventure: { category: "Sports", subCategory: "Adventure Sports" },
  cycling: { category: "Sports", subCategory: "Adventure Sports", subSubCategory: "Cycling" },
  cycle: { category: "Sports", subCategory: "Adventure Sports", subSubCategory: "Cycling" },
  camping: { category: "Sports", subCategory: "Adventure Sports", subSubCategory: "Camping" },
  camp: { category: "Sports", subCategory: "Adventure Sports", subSubCategory: "Camping" },
  hiking: { category: "Sports", subCategory: "Adventure Sports", subSubCategory: "Hiking" },
  hike: { category: "Sports", subCategory: "Adventure Sports", subSubCategory: "Hiking" },
  skating: { category: "Sports", subCategory: "Adventure Sports", subSubCategory: "Skating" },
  skate: { category: "Sports", subCategory: "Adventure Sports", subSubCategory: "Skating" },

  // ================== FITNESS ==================
  fitness: { category: "Fitness" },
  exercise: { category: "Fitness" },
  workout: { category: "Fitness" },

  // Gym Equipment
  gym: { category: "Fitness", subCategory: "Gym Equipment" },
  "gym equipment": { category: "Fitness", subCategory: "Gym Equipment" },
  dumbbell: { category: "Fitness", subCategory: "Gym Equipment", subSubCategory: "Dumbbells" },
  dumbbells: { category: "Fitness", subCategory: "Gym Equipment", subSubCategory: "Dumbbells" },
  treadmill: { category: "Fitness", subCategory: "Gym Equipment", subSubCategory: "Treadmills" },
  treadmills: { category: "Fitness", subCategory: "Gym Equipment", subSubCategory: "Treadmills" },
  "exercise bike": { category: "Fitness", subCategory: "Gym Equipment", subSubCategory: "Exercise Bikes" },
  "exercise bikes": { category: "Fitness", subCategory: "Gym Equipment", subSubCategory: "Exercise Bikes" },
  "weight plate": { category: "Fitness", subCategory: "Gym Equipment", subSubCategory: "Weight Plates" },
  "weight plates": { category: "Fitness", subCategory: "Gym Equipment", subSubCategory: "Weight Plates" },

  // Yoga
  yoga: { category: "Fitness", subCategory: "Yoga" },
  "yoga mat": { category: "Fitness", subCategory: "Yoga", subSubCategory: "Yoga Mats" },
  "yoga mats": { category: "Fitness", subCategory: "Yoga", subSubCategory: "Yoga Mats" },
  "yoga block": { category: "Fitness", subCategory: "Yoga", subSubCategory: "Yoga Blocks" },
  "yoga blocks": { category: "Fitness", subCategory: "Yoga", subSubCategory: "Yoga Blocks" },
  "resistance band": { category: "Fitness", subCategory: "Yoga", subSubCategory: "Resistance Bands" },
  "resistance bands": { category: "Fitness", subCategory: "Yoga", subSubCategory: "Resistance Bands" },

  // Supplements
  supplements: { category: "Fitness", subCategory: "Supplements" },
  supplement: { category: "Fitness", subCategory: "Supplements" },
  "protein powder": { category: "Fitness", subCategory: "Supplements", subSubCategory: "Protein Powder" },
  protein: { category: "Fitness", subCategory: "Supplements", subSubCategory: "Protein Powder" },
  vitamin: { category: "Fitness", subCategory: "Supplements", subSubCategory: "Vitamins" },
  vitamins: { category: "Fitness", subCategory: "Supplements", subSubCategory: "Vitamins" },
  "energy bar": { category: "Fitness", subCategory: "Supplements", subSubCategory: "Energy Bars" },
  "energy bars": { category: "Fitness", subCategory: "Supplements", subSubCategory: "Energy Bars" },

  // ================== PERSONAL CARE ==================
  "personal care": { category: "Personal Care" },
  personalcare: { category: "Personal Care" },
  hygiene: { category: "Personal Care" },

  // Oral Care
  "oral care": { category: "Personal Care", subCategory: "Oral Care" },
  oralcare: { category: "Personal Care", subCategory: "Oral Care" },
  toothpaste: { category: "Personal Care", subCategory: "Oral Care", subSubCategory: "Toothpaste" },
  toothbrush: { category: "Personal Care", subCategory: "Oral Care", subSubCategory: "Toothbrush" },
  mouthwash: { category: "Personal Care", subCategory: "Oral Care", subSubCategory: "Mouthwash" },

  // Body Care
  "body care": { category: "Personal Care", subCategory: "Body Care" },
  bodycare: { category: "Personal Care", subCategory: "Body Care" },
  soap: { category: "Personal Care", subCategory: "Body Care", subSubCategory: "Soap" },
  "body wash": { category: "Personal Care", subCategory: "Body Care", subSubCategory: "Body Wash" },
  "body lotion": { category: "Personal Care", subCategory: "Body Care", subSubCategory: "Body Lotion" },
  deodorant: { category: "Personal Care", subCategory: "Body Care", subSubCategory: "Deodorant" },

  // ================== GROCERY ==================
  grocery: { category: "Grocery" },
  groceries: { category: "Grocery" },
  food: { category: "Grocery" },

  // Staples
  staples: { category: "Grocery", subCategory: "Staples" },
  rice: { category: "Grocery", subCategory: "Staples", subSubCategory: "Rice" },
  pulses: { category: "Grocery", subCategory: "Staples", subSubCategory: "Pulses" },
  spice: { category: "Grocery", subCategory: "Staples", subSubCategory: "Spices" },
  spices: { category: "Grocery", subCategory: "Staples", subSubCategory: "Spices" },
  flour: { category: "Grocery", subCategory: "Staples", subSubCategory: "Flour" },
  oil: { category: "Grocery", subCategory: "Staples", subSubCategory: "Oil" },
  "cooking oil": { category: "Grocery", subCategory: "Staples", subSubCategory: "Oil" },

  // Dairy & Bakery
  dairy: { category: "Grocery", subCategory: "Dairy & Bakery" },
  bakery: { category: "Grocery", subCategory: "Dairy & Bakery" },
  milk: { category: "Grocery", subCategory: "Dairy & Bakery", subSubCategory: "Milk" },
  bread: { category: "Grocery", subCategory: "Dairy & Bakery", subSubCategory: "Bread" },
  cheese: { category: "Grocery", subCategory: "Dairy & Bakery", subSubCategory: "Cheese" },
  butter: { category: "Grocery", subCategory: "Dairy & Bakery", subSubCategory: "Butter" },
  egg: { category: "Grocery", subCategory: "Dairy & Bakery", subSubCategory: "Eggs" },
  eggs: { category: "Grocery", subCategory: "Dairy & Bakery", subSubCategory: "Eggs" },

  // Snacks
  snacks: { category: "Grocery", subCategory: "Snacks" },
  snack: { category: "Grocery", subCategory: "Snacks" },
  chips: { category: "Grocery", subCategory: "Snacks", subSubCategory: "Chips" },
  biscuit: { category: "Grocery", subCategory: "Snacks", subSubCategory: "Biscuits" },
  biscuits: { category: "Grocery", subCategory: "Snacks", subSubCategory: "Biscuits" },
  cookie: { category: "Grocery", subCategory: "Snacks", subSubCategory: "Biscuits" },
  cookies: { category: "Grocery", subCategory: "Snacks", subSubCategory: "Biscuits" },
  chocolate: { category: "Grocery", subCategory: "Snacks", subSubCategory: "Chocolates" },
  chocolates: { category: "Grocery", subCategory: "Snacks", subSubCategory: "Chocolates" },

  // Beverages
  beverages: { category: "Grocery", subCategory: "Beverages" },
  beverage: { category: "Grocery", subCategory: "Beverages" },
  tea: { category: "Grocery", subCategory: "Beverages", subSubCategory: "Tea" },
  coffee: { category: "Grocery", subCategory: "Beverages", subSubCategory: "Coffee" },
  juice: { category: "Grocery", subCategory: "Beverages", subSubCategory: "Juice" },
  "soft drink": { category: "Grocery", subCategory: "Beverages", subSubCategory: "Soft Drinks" },
  "soft drinks": { category: "Grocery", subCategory: "Beverages", subSubCategory: "Soft Drinks" },
  soda: { category: "Grocery", subCategory: "Beverages", subSubCategory: "Soft Drinks" },

  // ================== TOYS ==================
  toys: { category: "Toys" },
  toy: { category: "Toys" },

  // Educational Toys
  "educational toys": { category: "Toys", subCategory: "Educational Toys" },
  "educational toy": { category: "Toys", subCategory: "Educational Toys" },
  "learning toys": { category: "Toys", subCategory: "Educational Toys" },
  "learning toy": { category: "Toys", subCategory: "Educational Toys" },
  "puzzle game": { category: "Toys", subCategory: "Educational Toys", subSubCategory: "Puzzle Games" },
  "puzzle games": { category: "Toys", subCategory: "Educational Toys", subSubCategory: "Puzzle Games" },
  puzzle: { category: "Toys", subCategory: "Educational Toys", subSubCategory: "Puzzle Games" },
  "building blocks": { category: "Toys", subCategory: "Educational Toys", subSubCategory: "Building Blocks" },
  "building block": { category: "Toys", subCategory: "Educational Toys", subSubCategory: "Building Blocks" },

  // Outdoor Toys
  "outdoor toys": { category: "Toys", subCategory: "Outdoor Toys" },
  "outdoor toy": { category: "Toys", subCategory: "Outdoor Toys" },
  "ride on toy": { category: "Toys", subCategory: "Outdoor Toys", subSubCategory: "Ride-On Toys" },
  "ride on toys": { category: "Toys", subCategory: "Outdoor Toys", subSubCategory: "Ride-On Toys" },
  "ride-on toy": { category: "Toys", subCategory: "Outdoor Toys", subSubCategory: "Ride-On Toys" },
  "ride-on toys": { category: "Toys", subCategory: "Outdoor Toys", subSubCategory: "Ride-On Toys" },
  "swing set": { category: "Toys", subCategory: "Outdoor Toys", subSubCategory: "Swing Sets" },
  "swing sets": { category: "Toys", subCategory: "Outdoor Toys", subSubCategory: "Swing Sets" },
  "water toy": { category: "Toys", subCategory: "Outdoor Toys", subSubCategory: "Water Toys" },
  "water toys": { category: "Toys", subCategory: "Outdoor Toys", subSubCategory: "Water Toys" },

  // Action Figures
  "action figures": { category: "Toys", subCategory: "Action Figures" },
  "action figure": { category: "Toys", subCategory: "Action Figures" },
  "doll house": { category: "Toys", subCategory: "Action Figures", subSubCategory: "Doll Houses" },
  "doll houses": { category: "Toys", subCategory: "Action Figures", subSubCategory: "Doll Houses" },
  "dollhouse": { category: "Toys", subCategory: "Action Figures", subSubCategory: "Doll Houses" },
  "dollhouses": { category: "Toys", subCategory: "Action Figures", subSubCategory: "Doll Houses" },
  "toy car": { category: "Toys", subCategory: "Action Figures", subSubCategory: "Toy Cars" },
  "toy cars": { category: "Toys", subCategory: "Action Figures", subSubCategory: "Toy Cars" },
  "remote control car": { category: "Toys", subCategory: "Action Figures", subSubCategory: "Remote Control Cars" },
  "remote control cars": { category: "Toys", subCategory: "Action Figures", subSubCategory: "Remote Control Cars" },

  // ================== SO ==================
  so: { category: "Personal Care", subCategory: "Oral Care", subSubCategory: "Mouthwash" },
  sos: { category: "Personal Care", subCategory: "Oral Care", subSubCategory: "Mouthwash" },
};

// ✅ Find keyword function (keeps existing ops + API fallback)
export async function findKeyword(input) {
  const searchLower = input.toLowerCase().trim();

  // 1. Direct local match
  if (keywordMappings[searchLower]) return keywordMappings[searchLower];

  // 2. Normalized match (ignores - and space)
  const normalized = searchLower.replace(/[-\s]/g, "");
  for (const key in keywordMappings) {
    if (normalized === key.replace(/[-\s]/g, "")) {
      return keywordMappings[key];
    }
  }

  // 3. API synonym lookup (Datamuse free API)
  try {
    const res = await axios.get(`https://api.datamuse.com/words?ml=${searchLower}`);
    if (res.data && res.data.length > 0) {
      for (let word of res.data.slice(0, 5)) {
        const synonym = word.word.toLowerCase();
        if (keywordMappings[synonym]) {
          return keywordMappings[synonym];
        }
      }
    }
  } catch (err) {
    console.warn("⚠️ Synonym API failed:", err.message);
  }

  // 4. Nothing found
  return null;
}

export default keywordMappings;