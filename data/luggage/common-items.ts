import type { CommonItem, ItemCategory } from '@/lib/types/packing';

/**
 * Static database of ~200 common travel items with realistic weights
 * Based on actual travel experience
 * Supports both English and Spanish names for autocomplete
 */
export const COMMON_ITEMS: Record<ItemCategory, CommonItem[]> = {
  Clothing: [
    { name: 'T-shirt', nameES: 'Camiseta', weight: 150, category: 'Clothing' },
    { name: 'Tank top', nameES: 'Camiseta sin mangas', weight: 100, category: 'Clothing' },
    { name: 'Long-sleeve shirt', nameES: 'Camisa manga larga', weight: 200, category: 'Clothing' },
    { name: 'Button-up shirt', nameES: 'Camisa de botones', weight: 250, category: 'Clothing' },
    { name: 'Polo shirt', nameES: 'Polo', weight: 200, category: 'Clothing' },
    { name: 'Sweater', nameES: 'Suéter', weight: 400, category: 'Clothing' },
    { name: 'Hoodie', nameES: 'Sudadera con capucha', weight: 500, category: 'Clothing' },
    { name: 'Cardigan', nameES: 'Cardigan', weight: 350, category: 'Clothing' },
    { name: 'Light jacket', nameES: 'Chaqueta ligera', weight: 500, category: 'Clothing' },
    { name: 'Winter jacket', nameES: 'Chaqueta de invierno', weight: 1200, category: 'Clothing' },
    { name: 'Rain jacket', nameES: 'Chaqueta impermeable', weight: 400, category: 'Clothing' },
    { name: 'Down jacket', nameES: 'Chaqueta de plumas', weight: 600, category: 'Clothing' },
    { name: 'Jeans', nameES: 'Jeans', weight: 600, category: 'Clothing' },
    { name: 'Pants', nameES: 'Pantalones', weight: 400, category: 'Clothing' },
    { name: 'Shorts', nameES: 'Pantalones cortos', weight: 250, category: 'Clothing' },
    { name: 'Leggings', nameES: 'Leggings', weight: 200, category: 'Clothing' },
    { name: 'Skirt', nameES: 'Falda', weight: 200, category: 'Clothing' },
    { name: 'Dress', nameES: 'Vestido', weight: 300, category: 'Clothing' },
    { name: 'Underwear', nameES: 'Ropa interior', weight: 50, category: 'Clothing' },
    { name: 'Socks', nameES: 'Calcetines', weight: 50, category: 'Clothing' },
    { name: 'Bra', nameES: 'Sujetador', weight: 50, category: 'Clothing' },
    { name: 'Sports bra', nameES: 'Sujetador deportivo', weight: 80, category: 'Clothing' },
    { name: 'Swimsuit', nameES: 'Traje de baño', weight: 150, category: 'Clothing' },
    { name: 'Pajamas', nameES: 'Pijama', weight: 250, category: 'Clothing' },
    { name: 'Scarf', nameES: 'Bufanda', weight: 150, category: 'Clothing' },
    { name: 'Tie', nameES: 'Corbata', weight: 100, category: 'Clothing' },
    { name: 'Belt', nameES: 'Cinturón', weight: 200, category: 'Clothing' },
    { name: 'Gloves', nameES: 'Guantes', weight: 100, category: 'Clothing' },
    { name: 'Hat', nameES: 'Sombrero', weight: 150, category: 'Clothing' },
    { name: 'Cap', nameES: 'Gorra', weight: 100, category: 'Clothing' },
    { name: 'Beanie', nameES: 'Gorro', weight: 80, category: 'Clothing' },
  ],

  Shoes: [
    { name: 'Sneakers', nameES: 'Zapatillas deportivas', weight: 600, category: 'Shoes' },
    { name: 'Running shoes', nameES: 'Zapatillas de correr', weight: 500, category: 'Shoes' },
    { name: 'Dress shoes', nameES: 'Zapatos de vestir', weight: 700, category: 'Shoes' },
    { name: 'Boots', nameES: 'Botas', weight: 900, category: 'Shoes' },
    { name: 'Sandals', nameES: 'Sandalias', weight: 400, category: 'Shoes' },
    { name: 'Flip-flops', nameES: 'Chanclas', weight: 200, category: 'Shoes' },
    { name: 'Slippers', nameES: 'Pantuflas', weight: 150, category: 'Shoes' },
    { name: 'Hiking boots', nameES: 'Botas de senderismo', weight: 1200, category: 'Shoes' },
    { name: 'High heels', nameES: 'Tacones', weight: 500, category: 'Shoes' },
    { name: 'Ballet flats', nameES: 'Bailarinas', weight: 300, category: 'Shoes' },
  ],

  Electronics: [
    { name: 'Smartphone', nameES: 'Smartphone', weight: 200, category: 'Electronics' },
    { name: 'Laptop', nameES: 'Portátil', weight: 1500, category: 'Electronics' },
    { name: 'Tablet', nameES: 'Tablet', weight: 450, category: 'Electronics' },
    { name: 'E-reader', nameES: 'Lector electrónico', weight: 200, category: 'Electronics' },
    { name: 'Camera', nameES: 'Cámara', weight: 500, category: 'Electronics' },
    { name: 'GoPro', nameES: 'GoPro', weight: 120, category: 'Electronics' },
    { name: 'Headphones', nameES: 'Auriculares', weight: 250, category: 'Electronics' },
    { name: 'Earbuds', nameES: 'Auriculares inalámbricos', weight: 50, category: 'Electronics' },
    { name: 'Phone charger', nameES: 'Cargador de teléfono', weight: 100, category: 'Electronics' },
    { name: 'Laptop charger', nameES: 'Cargador de portátil', weight: 300, category: 'Electronics' },
    { name: 'Power bank', nameES: 'Batería portátil', weight: 250, category: 'Electronics' },
    { name: 'USB cable', nameES: 'Cable USB', weight: 30, category: 'Electronics' },
    { name: 'Travel adapter', nameES: 'Adaptador de viaje', weight: 100, category: 'Electronics' },
    { name: 'Hair dryer', nameES: 'Secador de pelo', weight: 600, category: 'Electronics' },
    { name: 'Electric shaver', nameES: 'Afeitadora eléctrica', weight: 200, category: 'Electronics' },
    { name: 'Curling iron', nameES: 'Rizador', weight: 400, category: 'Electronics' },
    { name: 'Hair straightener', nameES: 'Plancha de pelo', weight: 350, category: 'Electronics' },
    { name: 'Smartwatch', nameES: 'Reloj inteligente', weight: 50, category: 'Electronics' },
    { name: 'Portable speaker', nameES: 'Altavoz portátil', weight: 300, category: 'Electronics' },
  ],

  Toiletries: [
    { name: 'Toothbrush', nameES: 'Cepillo de dientes', weight: 20, category: 'Toiletries' },
    { name: 'Toothpaste', nameES: 'Pasta de dientes', weight: 100, category: 'Toiletries' },
    { name: 'Shampoo (travel size)', nameES: 'Champú (tamaño viaje)', weight: 100, category: 'Toiletries' },
    { name: 'Conditioner (travel size)', nameES: 'Acondicionador (tamaño viaje)', weight: 100, category: 'Toiletries' },
    { name: 'Body wash', nameES: 'Gel de baño', weight: 100, category: 'Toiletries' },
    { name: 'Soap bar', nameES: 'Jabón en barra', weight: 100, category: 'Toiletries' },
    { name: 'Deodorant', nameES: 'Desodorante', weight: 80, category: 'Toiletries' },
    { name: 'Sunscreen', nameES: 'Protector solar', weight: 150, category: 'Toiletries' },
    { name: 'Moisturizer', nameES: 'Crema hidratante', weight: 100, category: 'Toiletries' },
    { name: 'Face wash', nameES: 'Limpiador facial', weight: 100, category: 'Toiletries' },
    { name: 'Makeup remover', nameES: 'Desmaquillador', weight: 100, category: 'Toiletries' },
    { name: 'Razor', nameES: 'Maquinilla de afeitar', weight: 50, category: 'Toiletries' },
    { name: 'Shaving cream', nameES: 'Crema de afeitar', weight: 100, category: 'Toiletries' },
    { name: 'Hairbrush', nameES: 'Cepillo de pelo', weight: 150, category: 'Toiletries' },
    { name: 'Comb', nameES: 'Peine', weight: 30, category: 'Toiletries' },
    { name: 'Hair ties', nameES: 'Coleteros', weight: 10, category: 'Toiletries' },
    { name: 'Bobby pins', nameES: 'Horquillas', weight: 10, category: 'Toiletries' },
    { name: 'Nail clipper', nameES: 'Cortaúñas', weight: 30, category: 'Toiletries' },
    { name: 'Tweezers', nameES: 'Pinzas', weight: 20, category: 'Toiletries' },
    { name: 'Contact lenses', nameES: 'Lentes de contacto', weight: 50, category: 'Toiletries' },
    { name: 'Contact solution', nameES: 'Solución para lentes', weight: 100, category: 'Toiletries' },
    { name: 'Glasses', nameES: 'Gafas', weight: 100, category: 'Toiletries' },
    { name: 'Makeup bag', nameES: 'Neceser de maquillaje', weight: 300, category: 'Toiletries', notes: 'Weight varies' },
    { name: 'Perfume/Cologne', nameES: 'Perfume/Colonia', weight: 100, category: 'Toiletries' },
    { name: 'Cotton swabs', nameES: 'Bastoncillos', weight: 30, category: 'Toiletries' },
    { name: 'Tissues', nameES: 'Pañuelos', weight: 50, category: 'Toiletries' },
    { name: 'Hand sanitizer', nameES: 'Gel desinfectante', weight: 80, category: 'Toiletries' },
    { name: 'Lip balm', nameES: 'Bálsamo labial', weight: 15, category: 'Toiletries' },
    { name: 'Tampons/Pads', nameES: 'Tampones/Compresas', weight: 100, category: 'Toiletries' },
  ],

  Accessories: [
    { name: 'Backpack', nameES: 'Mochila', weight: 600, category: 'Accessories' },
    { name: 'Daypack', nameES: 'Mochila pequeña', weight: 400, category: 'Accessories' },
    { name: 'Purse', nameES: 'Bolso', weight: 500, category: 'Accessories' },
    { name: 'Wallet', nameES: 'Cartera', weight: 100, category: 'Accessories' },
    { name: 'Sunglasses', nameES: 'Gafas de sol', weight: 50, category: 'Accessories' },
    { name: 'Watch', nameES: 'Reloj', weight: 100, category: 'Accessories' },
    { name: 'Umbrella', nameES: 'Paraguas', weight: 300, category: 'Accessories' },
    { name: 'Water bottle', nameES: 'Botella de agua', weight: 200, category: 'Accessories' },
    { name: 'Travel pillow', nameES: 'Almohada de viaje', weight: 200, category: 'Accessories' },
    { name: 'Eye mask', nameES: 'Antifaz', weight: 30, category: 'Accessories' },
    { name: 'Earplugs', nameES: 'Tapones para oídos', weight: 10, category: 'Accessories' },
    { name: 'Padlock', nameES: 'Candado', weight: 100, category: 'Accessories' },
    { name: 'Packing cubes', nameES: 'Organizadores de equipaje', weight: 150, category: 'Accessories', notes: 'Set of 3' },
    { name: 'Laundry bag', nameES: 'Bolsa de ropa sucia', weight: 50, category: 'Accessories' },
    { name: 'Reusable shopping bag', nameES: 'Bolsa reutilizable', weight: 50, category: 'Accessories' },
    { name: 'Ziplock bags', nameES: 'Bolsas con cierre', weight: 30, category: 'Accessories' },
    { name: 'Travel towel', nameES: 'Toalla de viaje', weight: 300, category: 'Accessories' },
    { name: 'Book', nameES: 'Libro', weight: 400, category: 'Accessories' },
    { name: 'Notebook', nameES: 'Cuaderno', weight: 200, category: 'Accessories' },
    { name: 'Pen', nameES: 'Bolígrafo', weight: 10, category: 'Accessories' },
    { name: 'Snacks', nameES: 'Snacks', weight: 200, category: 'Accessories', notes: 'Weight varies' },
    { name: 'Jewelry', nameES: 'Joyas', weight: 100, category: 'Accessories', notes: 'Weight varies' },
  ],

  Documents: [
    { name: 'Passport', nameES: 'Pasaporte', weight: 50, category: 'Documents' },
    { name: 'ID card', nameES: 'DNI', weight: 20, category: 'Documents' },
    { name: 'Driver\'s license', nameES: 'Licencia de conducir', weight: 20, category: 'Documents' },
    { name: 'Boarding pass', nameES: 'Tarjeta de embarque', weight: 10, category: 'Documents' },
    { name: 'Travel insurance', nameES: 'Seguro de viaje', weight: 10, category: 'Documents' },
    { name: 'Credit cards', nameES: 'Tarjetas de crédito', weight: 20, category: 'Documents' },
    { name: 'Cash', nameES: 'Efectivo', weight: 50, category: 'Documents', notes: 'Weight varies' },
    { name: 'Hotel reservation', nameES: 'Reserva de hotel', weight: 10, category: 'Documents' },
    { name: 'Vaccination card', nameES: 'Certificado de vacunación', weight: 10, category: 'Documents' },
  ],

  Other: [
    { name: 'Medications', nameES: 'Medicamentos', weight: 100, category: 'Other', notes: 'Weight varies' },
    { name: 'First aid kit', nameES: 'Botiquín', weight: 200, category: 'Other' },
    { name: 'Vitamins', nameES: 'Vitaminas', weight: 100, category: 'Other' },
    { name: 'Insect repellent', nameES: 'Repelente de insectos', weight: 100, category: 'Other' },
    { name: 'Tissues (pack)', nameES: 'Paquete de pañuelos', weight: 50, category: 'Other' },
    { name: 'Wet wipes', nameES: 'Toallitas húmedas', weight: 100, category: 'Other' },
    { name: 'Sewing kit', nameES: 'Kit de costura', weight: 50, category: 'Other' },
    { name: 'Safety pins', nameES: 'Imperdibles', weight: 20, category: 'Other' },
    { name: 'Flashlight', nameES: 'Linterna', weight: 150, category: 'Other' },
    { name: 'Multi-tool', nameES: 'Multiherramienta', weight: 200, category: 'Other' },
    { name: 'Duct tape', nameES: 'Cinta adhesiva', weight: 100, category: 'Other' },
  ],
};

/**
 * Flattens all items into a single array for searching
 */
export function getAllCommonItems(): CommonItem[] {
  return Object.values(COMMON_ITEMS).flat();
}

/**
 * Gets total count of items in database
 */
export function getCommonItemsCount(): number {
  return getAllCommonItems().length;
}
