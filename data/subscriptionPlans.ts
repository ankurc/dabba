export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  img: string[];
  price: number;
  mealsPerWeek: number;
  servingsPerMeal: number;
  isPopular: boolean;
  features: string[];
  billingTerm: 'biweekly';
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    description: 'Perfect for starters',
    img: [require('../assets/images/plans/basic.webp'), require('../assets/images/plans/premium.webp')],
    price: 90.00,
    mealsPerWeek: 3,
    servingsPerMeal: 2,
    isPopular: false,
    billingTerm: 'biweekly',
    features: [
      '6 meals every 2 weeks',
      'Two serving portions',
      'Bi-weekly menu selection',
      'Free delivery'
    ]
  },
  {
    id: 'family',
    name: 'Family Plan',
    description: 'Ideal for families',
    img: [require('../assets/images/plans/family.webp'), require('../assets/images/plans/premium.webp')],
    price: 120.00,
    mealsPerWeek: 4,
    servingsPerMeal: 2,
    isPopular: true,
    billingTerm: 'biweekly',
    features: [
      '8 meals every 2 weeks',
      'Two serving portions',
      'Bi-weekly menu selection',
      'Free delivery',
      'Family-friendly recipes'
    ]
  },
  {
    id: 'couple',
    name: 'Couple Plan',
    description: 'Great for couples',
    img: [require('../assets/images/plans/couple.webp'), require('../assets/images/plans/family.webp')],
    price: 120.00,
    mealsPerWeek: 4,
    servingsPerMeal: 2,
    isPopular: false,
    billingTerm: 'biweekly',
    features: [
      '8 meals every 2 weeks',
      'Two serving portions',
      'Bi-weekly menu selection',
      'Free delivery',
      'Date night specials'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    description: 'Gourmet experience',
    img: [require('../assets/images/plans/premium.webp'), require('../assets/images/plans/premium.webp')],
    price: 150.00,
    mealsPerWeek: 5,
    servingsPerMeal: 2,
    isPopular: false,
    billingTerm: 'biweekly',
    features: [
      '10 meals every 2 weeks',
      'Two serving portions',
      'Premium ingredients',
      'Chef-curated menus',
      'Priority bi-weekly delivery',
      'Wine pairing suggestions'
    ]
  }
]; 