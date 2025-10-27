import { Capacitor } from '@capacitor/core';
import { Purchases, PurchasesPackage, CustomerInfo } from '@revenuecat/purchases-capacitor';
import { logger } from '@/utils/logger';

const iapLogger = logger.withContext('IAP');

// RevenueCat API Key
const REVENUECAT_API_KEY = 'appl_OawSagzgiUmuvJHNtjpIJqziOTK';

// Package identifiers from RevenueCat
export const PACKAGE_IDS = {
  CUSTOMER_MONTHLY: 'customer_monthly',
  BUSINESS_MONTHLY: 'business_monthly',
  CREDIT: 'credit',
  LIFETIME: 'lifetime'
};

/**
 * Initialize RevenueCat SDK
 * Should be called once when app starts on iOS
 */
export const initializeIAP = async (userId: string): Promise<boolean> => {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    iapLogger.info('Not on iOS, skipping IAP initialization');
    return false;
  }

  try {
    iapLogger.info('Initializing RevenueCat with user:', userId);

    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: userId
    });

    iapLogger.info('RevenueCat initialized successfully');
    return true;
  } catch (error) {
    iapLogger.error('Failed to initialize RevenueCat:', error);
    return false;
  }
};

/**
 * Check if user has active subscription via RevenueCat
 */
export const checkSubscriptionStatus = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const hasActiveSubscription =
      customerInfo.customerInfo.entitlements.active['Welp Subscriptions'] !== undefined;

    iapLogger.info('Subscription status:', hasActiveSubscription);
    return hasActiveSubscription;
  } catch (error) {
    iapLogger.error('Failed to check subscription status:', error);
    return false;
  }
};

/**
 * Get available packages (offerings)
 */
export const getOfferings = async (): Promise<PurchasesPackage[]> => {
  try {
    iapLogger.info('🔍 Fetching offerings from RevenueCat...');
    const offerings = await Purchases.getOfferings();

    iapLogger.info('📦 Raw offerings response:', {
      hasOfferings: !!offerings,
      hasCurrent: !!offerings.current,
      currentId: offerings.current?.identifier,
      allOfferingIds: Object.keys(offerings.all || {})
    });

    if (!offerings.current) {
      iapLogger.warn('❌ No current offering available');
      iapLogger.warn('Available offering IDs:', Object.keys(offerings.all || {}));
      return [];
    }

    const packages = offerings.current.availablePackages;
    iapLogger.info(`✅ Found ${packages.length} packages in current offering`);

    // Log each package's details
    packages.forEach((pkg, index) => {
      iapLogger.info(`Package ${index + 1}:`, {
        identifier: pkg.identifier,
        packageType: pkg.packageType,
        product: {
          identifier: pkg.product?.identifier,
          title: pkg.product?.title,
          description: pkg.product?.description
        }
      });
    });

    return packages;
  } catch (error) {
    iapLogger.error('❌ Failed to get offerings:', error);
    return [];
  }
};

/**
 * Get specific package by identifier
 */
export const getPackage = async (packageId: string): Promise<PurchasesPackage | null> => {
  try {
    iapLogger.info(`🔍 Looking for package: ${packageId}`);
    const packages = await getOfferings();

    iapLogger.info('📦 Available package identifiers:', packages.map(p => p.identifier));

    const pkg = packages.find(p => p.identifier === packageId);

    if (!pkg) {
      iapLogger.warn(`❌ Package not found: ${packageId}`);
      iapLogger.warn(`Available packages: ${packages.map(p => p.identifier).join(', ')}`);
      return null;
    }

    iapLogger.info(`✅ Found package: ${packageId}`, {
      identifier: pkg.identifier,
      productId: pkg.product?.identifier
    });

    return pkg;
  } catch (error) {
    iapLogger.error('❌ Failed to get package:', error);
    return null;
  }
};

/**
 * Purchase a subscription (monthly or lifetime)
 */
export const purchaseSubscription = async (
  packageId: string
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> => {
  try {
    iapLogger.info('Starting purchase for package:', packageId);

    const pkg = await getPackage(packageId);
    if (!pkg) {
      return { success: false, error: 'Package not found' };
    }

    const result = await Purchases.purchasePackage({ aPackage: pkg });

    iapLogger.info('Purchase completed successfully');
    return {
      success: true,
      customerInfo: result.customerInfo
    };
  } catch (error: any) {
    iapLogger.error('Purchase failed:', error);

    // Check if user cancelled
    if (error.code === 'USER_CANCELLED') {
      return { success: false, error: 'Purchase cancelled' };
    }

    return {
      success: false,
      error: error.message || 'Purchase failed'
    };
  }
};

/**
 * Purchase credits (consumable)
 */
export const purchaseCredits = async (): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string
}> => {
  return purchaseSubscription(PACKAGE_IDS.CREDIT);
};

/**
 * Restore purchases
 */
export const restorePurchases = async (): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string
}> => {
  try {
    iapLogger.info('Restoring purchases');

    const result = await Purchases.restorePurchases();

    iapLogger.info('Purchases restored successfully');
    return {
      success: true,
      customerInfo: result.customerInfo
    };
  } catch (error: any) {
    iapLogger.error('Restore failed:', error);
    return {
      success: false,
      error: error.message || 'Restore failed'
    };
  }
};

/**
 * Check if running on iOS native
 */
export const isIOSNative = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
};

/**
 * Sync purchase with backend
 * This should be called after successful purchase to update Supabase
 */
export const syncPurchaseWithBackend = async (
  customerInfo: CustomerInfo,
  supabaseUserId: string
): Promise<boolean> => {
  try {
    iapLogger.info('Syncing purchase with backend');

    // The backend will receive webhook from RevenueCat automatically
    // This is just a backup sync call

    // You can call a Supabase function here if needed
    // For now, we rely on RevenueCat webhooks

    return true;
  } catch (error) {
    iapLogger.error('Failed to sync with backend:', error);
    return false;
  }
};
