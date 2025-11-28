import sql from '../db/index.js';

const DEFAULT_CATEGORY_SEED = [
	{ name: 'Stationery' },
	{ name: 'Books' },
	{ name: 'Clothing' },
	{ name: 'Electronics' },
	{ name: 'Accessories' },
];

export async function ensureDefaultCategories() {
	const [{ count }] = await sql`
		SELECT COUNT(*)::int AS count
		FROM "Categories"
	`;

	if (Number(count ?? 0) > 0) {
		return;
	}

	await sql.begin(async (trx) => {
		await trx`LOCK TABLE "Categories" IN SHARE ROW EXCLUSIVE MODE`;
		const [{ count: lockedCount }] = await trx`
			SELECT COUNT(*)::int AS count FROM "Categories"
		`;
		if (Number(lockedCount ?? 0) > 0) {
			return;
		}
		for (const category of DEFAULT_CATEGORY_SEED) {
			await trx`
				INSERT INTO "Categories" (name)
				VALUES (${category.name})
			`;
		}
	});
}

export async function categoryExists(categoryId) {
	const [{ exists }] = await sql`
		SELECT EXISTS (
			SELECT 1 FROM "Categories"
			WHERE category_id = ${categoryId}
		) AS exists
	`;
	return Boolean(exists);
}

export const DEFAULT_SORT_KEY = 'latest';
const SORT_EXPRESSIONS = {
	latest: sql`p.create_at DESC`,
	oldest: sql`p.create_at ASC`,
	price_asc: sql`p.price ASC`,
	price_desc: sql`p.price DESC`,
	stock_desc: sql`p.stock DESC`,
};

function buildFilterClauses({
	searchTerm,
	categoryId,
	sellerId,
	minPrice,
	maxPrice,
	includeAllStatuses,
	statusFilter,
}) {
	const conditions = [];

	if (searchTerm) {
		conditions.push(sql`p.description ILIKE ${'%' + searchTerm + '%'}`);
	}

	if (categoryId !== null && categoryId !== undefined) {
		conditions.push(sql`p.category_id = ${categoryId}`);
	}

	if (sellerId !== null && sellerId !== undefined) {
		conditions.push(sql`p.seller_id = ${sellerId}`);
	}

	if (minPrice !== null && minPrice !== undefined) {
		conditions.push(sql`p.price >= ${minPrice}`);
	}

	if (maxPrice !== null && maxPrice !== undefined) {
		conditions.push(sql`p.price <= ${maxPrice}`);
	}

	if (!includeAllStatuses) {
		conditions.push(sql`p.status = ${statusFilter || 'active'}`);
	}

	return conditions;
}

function buildWhereClause(filters) {
	const clauses = buildFilterClauses(filters);
	if (!clauses.length) {
		return sql``;
	}
	const combined = clauses.slice(1).reduce(
		(acc, clause) => sql`${acc} AND ${clause}`,
		clauses[0]
	);
	return sql`WHERE ${combined}`;
}

export function normalizeSortKey(sortKey = DEFAULT_SORT_KEY) {
	return SORT_EXPRESSIONS[sortKey] ? sortKey : DEFAULT_SORT_KEY;
}

export function resolveSort(sortKey = DEFAULT_SORT_KEY) {
	return SORT_EXPRESSIONS[normalizeSortKey(sortKey)];
}

export async function getCategoriesWithCounts() {
  await ensureDefaultCategories();
	return sql`
		SELECT
			c.category_id AS id,
			c.name,
			c.parent_category_id,
			COUNT(p.product_id)::int AS product_count
		FROM "Categories" c
		LEFT JOIN "Product" p ON p.category_id = c.category_id AND p.status = 'active'
		GROUP BY c.category_id
		ORDER BY c.name ASC
	`;
}

export async function countProducts(filters) {
	const whereClause = buildWhereClause(filters);
	const [{ count }] = await sql`
		SELECT COUNT(*)::int AS count
		FROM "Product" p
		${whereClause}
	`;
	return Number(count ?? 0);
}

export async function findProducts({ filters, orderBy, limit, offset }) {
	const whereClause = buildWhereClause(filters);
	return sql`
		WITH ProductReviews AS (
			SELECT
				item_id,
				COALESCE(AVG(rating), 0)::numeric(10, 2) AS rating_average,
				COUNT(*)::int AS rating_count
			FROM "Review"
			GROUP BY item_id
		),
		RankedImages AS (
			SELECT
				item_id,
				image_url,
				ROW_NUMBER() OVER(PARTITION BY item_id ORDER BY image_id ASC) as rn
			FROM "Product_Image"
		)
		SELECT
			p.product_id AS id,
			p.seller_id,
			p.category_id,
			c.name AS category_name,
			p.description AS description,
			p.name AS name,
			p.price,
			p.stock,
			p.ratings,
			p.status,
			p.create_at,
			p.updated_at,
			COALESCE(pr.rating_average, 0) AS rating_average,
			COALESCE(pr.rating_count, 0) AS rating_count,
			ri.image_url AS image
		FROM "Product" p
		LEFT JOIN "Categories" c ON c.category_id = p.category_id
		LEFT JOIN ProductReviews pr ON pr.item_id = p.product_id
		LEFT JOIN RankedImages ri ON ri.item_id = p.product_id AND ri.rn = 1
		${whereClause}
		ORDER BY ${orderBy}
		LIMIT ${limit} OFFSET ${offset}
	`;
}

export async function findProductById(productId) {
	const rows = await sql`
		SELECT
			p.product_id AS id,
			p.seller_id,
			p.category_id,
			c.name AS category_name,
			p.description AS description,
			p.name AS name,
			p.price,
			p.stock,
			p.ratings,
			p.status,
			p.create_at,
			p.updated_at,
			u.name AS seller_name,
			u.email AS seller_email,
			u.phone_number AS seller_phone,
			(
				SELECT COALESCE(AVG(r.rating), 0)::numeric(10,2)
				FROM "Review" r
				WHERE r.item_id = p.product_id
			) AS rating_average,
			(
				SELECT COUNT(*)::int
				FROM "Review" r
				WHERE r.item_id = p.product_id
			) AS rating_count
		FROM "Product" p
		LEFT JOIN "Categories" c ON c.category_id = p.category_id
		LEFT JOIN "User" u ON u.user_id = p.seller_id
		WHERE p.product_id = ${productId}
		LIMIT 1
	`;
	return rows[0] || null;
}

export async function productExists(productId) {
	const [{ exists }] = await sql`
		SELECT EXISTS (SELECT 1 FROM "Product" WHERE product_id = ${productId}) AS exists
	`;
	return Boolean(exists);
}

export async function findProductImages(productId) {
	return sql`
		SELECT image_id, image_url
		FROM "Product_Image"
		WHERE item_id = ${productId}
		ORDER BY image_id ASC
	`;
}

export async function findProductReviews(productId) {
	return sql`
		SELECT
			r.review_id AS id,
			r.item_id,
			r.user_id,
			u.name AS user_name,
			r.order_id,
			r.rating,
			r.comment,
			r.create_at
		FROM "Review" r
		LEFT JOIN "User" u ON u.user_id = r.user_id
		WHERE r.item_id = ${productId}
		ORDER BY r.create_at DESC
	`;
}

export async function createProduct({
	sellerId,
	categoryId,
	name,
	description,
	price,
	stock,
	status,
	images = [],
}) {
	let productId;

	await sql.begin(async (trx) => {
		const [product] = await trx`
			INSERT INTO "Product" (
				seller_id,
				category_id,
				name,
				ratings,
				stock,
				description,
				price,
				status,
				create_at,
				updated_at
			) VALUES (
				${sellerId},
				${categoryId},
				${name},
				${null},
				${stock},
				${description},
				${price},
				${status},
				NOW(),
				NOW()
			) RETURNING product_id AS id
		`;

		productId = product.id;

		if (images.length) {
			for (const url of images) {
				await trx`
					INSERT INTO "Product_Image" (item_id, image_url)
					VALUES (${productId}, ${url})
				`;
			}
		}
	});

	return productId;
}

export async function getProductOwnership(productId) {
	const rows = await sql`
		SELECT product_id, seller_id
		FROM "Product"
		WHERE product_id = ${productId}
		LIMIT 1
	`;
	return rows[0] || null;
}

export async function updateProduct(productId, updates) {
	const rows = await sql`
		UPDATE "Product"
		SET ${sql(updates)}, updated_at = NOW()
		WHERE product_id = ${productId}
		RETURNING product_id AS id
	`;
	return rows[0] || null;
}

export async function updateProductStock(productId, stock) {
	const rows = await sql`
		UPDATE "Product"
		SET stock = ${stock}, updated_at = NOW()
		WHERE product_id = ${productId}
		RETURNING product_id AS id, stock
	`;
	return rows[0] || null;
}

export async function decreaseProductStock(items) {
  await sql.begin(async (trx) => {
    for (const item of items) {
      await trx`
        UPDATE "Product"
        SET stock = stock - ${item.quantity},
            updated_at = NOW()
        WHERE product_id = ${item.productId}
      `;
    }
  });
}

export async function deleteProduct(productId) {
	const rows = await sql`
		DELETE FROM "Product"
		WHERE product_id = ${productId}
		RETURNING product_id AS id
	`;
	return rows[0] || null;
}

export async function createProductImage(productId, imageUrl) {
	const rows = await sql`
		INSERT INTO "Product_Image" (item_id, image_url)
		VALUES (${productId}, ${imageUrl})
		RETURNING image_id AS id, image_url
	`;
	return rows[0] || null;
}

export async function getProductImageWithSeller(productId, imageId) {
	const rows = await sql`
		SELECT i.image_id AS id, i.item_id, p.seller_id
		FROM "Product_Image" i
		JOIN "Product" p ON p.product_id = i.item_id
		WHERE i.item_id = ${productId} AND i.image_id = ${imageId}
		LIMIT 1
	`;
	return rows[0] || null;
}

export async function deleteProductImage(productId, imageId) {
	const rows = await sql`
		DELETE FROM "Product_Image"
		WHERE item_id = ${productId} AND image_id = ${imageId}
		RETURNING image_id AS id
	`;
	return rows[0] || null;
}

export async function createProductReview({ productId, userId, orderId, rating, comment }) {
	const rows = await sql`
		INSERT INTO "Review" (item_id, user_id, order_id, rating, comment, create_at)
		VALUES (${productId}, ${userId}, ${orderId}, ${rating}, ${comment || null}, NOW())
		RETURNING review_id AS id, rating, comment, create_at
	`;
	return rows[0] || null;
}

export async function findReviewById(reviewId) {
	const rows = await sql`
		SELECT review_id, user_id, item_id, order_id
		FROM "Review"
		WHERE review_id = ${reviewId}
		LIMIT 1
	`;
	return rows[0] || null;
}

export async function updateReview(reviewId, updates) {
	const rows = await sql`
		UPDATE "Review"
		SET ${sql(updates)}
		WHERE review_id = ${reviewId}
		RETURNING review_id AS id, item_id, user_id, order_id, rating, comment, create_at
	`;
	return rows[0] || null;
}

export async function deleteReview(reviewId) {
	const rows = await sql`
		DELETE FROM "Review"
		WHERE review_id = ${reviewId}
		RETURNING review_id AS id
	`;
	return rows[0] || null;
}

export async function findCompletedOrderForProductByUser({ userId, productId }) {
  const [order] = await sql`
    SELECT o.order_id
    FROM "Order" o
    JOIN "Order_Item" oi ON o.order_id = oi.order_id
    WHERE o.buyer_id = ${userId}
      AND oi.item_id = ${productId}
      AND o.status = 'completed'
    ORDER BY o.create_at DESC
    LIMIT 1
  `;
  return order || null;
}

export async function hasReviewForOrder({ productId, orderId, userId }) {
	const [{ already_reviewed }] = await sql`
		SELECT EXISTS (
			SELECT 1
			FROM "Review"
			WHERE item_id = ${productId}
				AND order_id = ${orderId}
				AND user_id = ${userId}
		) AS already_reviewed
	`;
	return Boolean(already_reviewed);
}
