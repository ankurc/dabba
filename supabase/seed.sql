INSERT INTO subscription_plans (
  name,
  description,
  price,
  meals_per_week,
  servings_per_meal,
  is_popular
) VALUES
  (
    'Starter Plan',
    'Perfect for individuals looking to try meal planning',
    69.99,
    3,
    2,
    false
  ),
  (
    'Family Plan',
    'Ideal for families, with generous portions and variety',
    129.99,
    4,
    4,
    true
  ),
  (
    'Couples Plan',
    'Great for couples who love cooking together',
    89.99,
    3,
    2,
    false
  ); 