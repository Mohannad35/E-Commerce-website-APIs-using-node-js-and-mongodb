import Category from './../model/category.js';

function seedCategory(title, parentId, parentTitle, isParent = false) {
	try {
		return new Category({ title, parent: { parentId, parentTitle }, isParent });
	} catch (error) {
		console.log(error);
		return error;
	}
}

export default async function () {
	console.log(`seeding categories...`);
	console.log(await Category.deleteMany({}));
	for (let element of Categories) {
		const category = seedCategory(element.parent, undefined, undefined, true);
		await category.save();
		for (let child of element.children) {
			if (child.parent) {
				const parentCh = seedCategory(child.parent, category._id, category.title, true);
				await parentCh.save();
				for (let ch of child.children) {
					const chh = seedCategory(ch, parentCh._id, parentCh.title, false);
					await chh.save();
				}
			} else {
				const ch = seedCategory(child, category._id, category.title, false);
				await ch.save();
			}
		}
	}
}

const Categories = [
	{
		parent: 'Mobiles, tablets & Accessories',
		children: [
			'Mobiles',
			'Tablets',
			'earphones',
			'Cases & Covers',
			'Power Banks & Chargers',
			'Cables'
		]
	},
	{
		parent: 'Computers & Accessories',
		children: [
			'Laptops',
			'Desktop & Monitors',
			'Drives & Storage',
			'Networking Devices',
			'Keyboards & Mice',
			'Graphic Cards',
			'Printers & Accessories',
			'headphones',
			'Speakers'
		]
	},
	{
		parent: 'Furniture',
		children: [
			{
				parent: 'Home',
				children: [
					'Home Décor',
					'Bedding & Linen',
					'Bath Accessories',
					'Storage & Organization',
					'Household Supplies',
					'Garden & Outdoors'
				]
			},
			{
				parent: 'Office',
				children: [
					'Tools & Home Improvement',
					'All Tools & Home Improvement',
					'Power Tools',
					'Hand Tools',
					'Lighting',
					'Tools Accessories'
				]
			}
		]
	},
	{
		parent: 'Electronics',
		children: ['Cameras', 'TVS']
	},
	{
		parent: 'Fashion',
		children: [
			{
				parent: `Man's Fashion`,
				children: ['Clothing', 'Watches', 'Sportswear', 'Accessories']
			},
			{
				parent: `Woman's Fashion`,
				children: [
					'Clothing',
					'Jewelry',
					'Sportswear',
					'Lingerie & Sleepwear',
					'Wearables',
					'Perfumes'
				]
			},
			`Kids' Fashion`,
			{
				parent: `Bags, Shoes & More`,
				children: ['Shoes', 'Bags & Wallets', 'Eyewear', 'Sports Shoes', 'Travel Bags & Backpacks']
			}
		]
	},
	{
		parent: 'Beauty',
		children: [`Make-up`, `Skin Care`, `Men's Grooming`, `Luxury Beauty`]
	},
	{
		parent: 'Health & Personal Care',
		children: [
			'All Health & Personal Care',
			'Personal Care Appliances',
			'Hair Care & Styling',
			'Bath & Body',
			'Dental Care'
		]
	},
	{
		parent: 'Kitchen & Appliances',
		children: [
			'Kitchen & Dining',
			'Cookware',
			'Bakeware',
			'Tableware',
			'Containers & Storage',
			'Kitchen Accessories',
			'Appliances',
			'Kitchen & Home Appliances',
			'Large Appliances',
			'Coffee Makers',
			'Blenders & Juicers',
			'Vacuums',
			'Refrigerators',
			'Washing Machines'
		]
	},
	{
		parent: 'Sports, Fitness & Outdoors',
		children: [
			'All Sports, Fitness & Outdoors',
			'Cardio Equipment',
			'Strength & Weight Equipment',
			'Fitness Technology',
			'Sports Apparel & Equipment',
			'Sports Supplements'
		]
	},
	{
		parent: 'Toys, Games & baby',
		children: [
			'All Baby Products',
			'Diapers',
			'Baby Care',
			'Travel Gear',
			'Nursing & Feeding',
			'Baby Fashion',
			'Nursery Furniture',
			'Toys & Games',
			'Outdoor Play',
			'Action Figures',
			'Dolls & Accessories',
			'Construction Toys'
		]
	}
];
