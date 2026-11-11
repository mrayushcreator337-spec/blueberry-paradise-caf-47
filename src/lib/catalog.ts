export type Category = { id: string; slug: string; name: string; description: string | null; price_labels: string[]; sort_order: number; is_active: boolean };
export type MenuItem = { id: string; category_id: string; name: string; description: string | null; prices: number[]; is_available: boolean; image_url: string | null; sort_order: number; is_featured: boolean };
const groups: [string, string, string[], string][] = [
['pizza','Pizza',['8 inch','10 inch'],'Classic Margherita:150,190;Sweet Corn:150,200;Ultimate Veg:160,210;Mushroom & Olive:160,210;Farmhouse:180,230;Cheese & Tomato:190,240;Paneer Masala:200,250;Peppy Paneer:200,250'],
['hot-dogs','Hot dogs',[],'Veggie Hot Dog;Paneer Hot Dog;Mushroom Hot Dog'],
['garlic','Hot Garlic',[],'Classic Garlic Bread:80;Cheese Garlic Bread:110;American Garlic Bread:130;Peppy Cheese Garlic Bread:120;Tomato Bruschetta:120;Italian Cheese Toast:120'],
['rolls','Rolls',[],'Veg Kathi Roll;Paneer Kathi Roll;Alu Makhani Kathi Roll'],
['sandwiches','Sandwiches',[],'Veg Cheese Sandwich:100;Paneer Masala Sandwich:150;Cheese Chilli Sandwich:150;Paneer Chilli Sandwich:180;Traditional BBQ Sandwich:100;Aloo Masala Sandwich:90'],
['momos','Momos',['6 pcs'],'Veg Momo:80;Paneer Momo:100;Cheese Momo:100;Palak Momo:100;Veg Kurkure Momo:100;Paneer Kurkure Momo:150'],
['fries','Fries & snacks',[],'Classic French Fries:110;Peri Peri Fries:120;Magic Masala Fries:120;Pizza Fries:120;BBQ Fries:120;Potato Wedges:120;Smiley:120;Nachos with Cheese:150;Veggies Finger:100;Pizza Pocket:120;Veg Nuggets:120;Cheese Corn Nuggets:120;Cheese Corn Ball:150'],
['pasta','Pasta',['onwards'],'Pasta (ask for variety):180'],
['maggi','Maggi',[],'Veggie Maggi:100;Paneer Maggi:150;Cheese Maggi:160;Cheese Paneer Maggi:180'],
['starters','Starters (dry)',[],'Veg Manchurian Dry:150;Paneer Chilli Dry:180;Chilli Baby Corn Dry:180;Mushroom Chilli Dry:180;BBQ Paneer Stick:180;Potato Chilli Dry:180;Honey Potato Dry:180'],
['sizzlers','Sizzlers',[],'Veg Chinese Sizzler:300;Combo Rice, Noodles & Manchurian:350;Paneer Butter Sizzler;Combo Rice, Paneer & Noodles-Gravy;Mushroom Sizzler;Combo Schezwan Rice & Mushroom Gravy'],
['main-course','Noodles, rice & main course',[],'Veg Chowmin:100;Hakka Noodles:150;Schezwan Noodles:160;Paneer Noodles:180;Veg Fried Rice:150;Mushroom Fried Rice:180;Paneer Fried Rice:180;Schezwan Fried Rice:180;Manchurian Gravy:180;Paneer Chilli Gravy:190;Mushroom Chilli Gravy:190;Paneer Chilli (gravy):190'],
['coffee','Coffee & tea',[],'Blueberry Special Tea;Hot Coffee;Cappuccino Coffee;Cold Coffee;Cold Coffee with Ice Cream'],
['shakes','Shakes & iced tea',[],'Mint Mojito:100;Lemon Ice Tea:100;Blueberry Ice Tea:100;KitKat Shake:140;Oreo Shake:120;Mango Shake:120;Butter Scotch Shake:120'],
['desserts','Desserts',[],'Classic Vanilla Cupcake:21;Redvelvet Cupcake:21;Dark Chocolate Cupcake:21;Dark Truffle Pastry:70;Redvelvet Pastry:90;White Forest Pastry:60;Black Forest Pastry:70;Donut:50;Muffin:60;Cheesecake Pastry:100;Brownie:50;Brownie with Ice-Cream:90;Brownie with Hot Chocolate:90;Choco Lava:50;Choco Lava with Ice-Cream:90;Macarons:50'],
['cakes','Celebration cakes',['Half kg','1 kg'],'Classic Cake:300,600;Premium Cake:350,700;Exotic Cake:380,760;Supreme Cake:500,1000;Indian Cake:600,1200;Shape Cake / Semi Fondant:1300'],
];
export const cakeFlavours: Record<string,string> = {
'Classic Cake':'Pineapple, Blueberry, Strawberry, Mango, Litchi, Black Forest',
'Premium Cake':'Chocoholic, Chocolate Sata, White Forest, Chocolate Vanilla',
'Exotic Cake':'WhiteChocoChip, Chocolate Mousse, Dark Chocolate, Dark Chocochip',
'Supreme Cake':'Basket Shape, Double Chocochip, Overload by WhiteChocochip, Overload by Darkchocochip, Cupcake Drip, Rainbow, Doll Cake',
'Indian Cake':'Rasmalai, Motichoor, Kaju Katli, Gulkand Laddu',
'Shape Cake / Semi Fondant':'₹1300 per kg. Custom shapes by enquiry.',
};
export const fallbackCategories: Category[] = groups.map(([slug,name,price_labels],i)=>({id:slug,slug,name,price_labels,description:null,sort_order:i,is_active:true}));
export const fallbackItems: MenuItem[] = groups.flatMap(([slug,,,list])=>list.split(';').map((entry,i)=>{const [name,value]=entry.split(':');return {id:`${slug}-${i}`,category_id:slug,name,prices:value?value.split(',').map(Number):[],description:cakeFlavours[name]??null,is_available:true,is_featured:false,image_url:null,sort_order:i};}));
export function priceLabel(item: MenuItem, category?: Category) {
 if (!item.prices.length) return 'Ask for price';
 if (item.name === 'Shape Cake / Semi Fondant') return '₹1300 / kg';
 return item.prices.map((p,i)=>`₹${p}${category?.price_labels[i]?` / ${category.price_labels[i]}`:''}`).join(' · ');
}
