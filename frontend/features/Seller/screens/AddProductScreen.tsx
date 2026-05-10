import React, { useEffect, useMemo, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AddProductHeader from '../components/addProduct/AddProductHeader';
import ProductImagesSection from '../components/addProduct/ProductImagesSection';
import ProductDetailsSection from '../components/addProduct/ProductDetailsSection';
import ProductPricingSection from '../components/addProduct/ProductPricingSection';
import ProductShippingSection from '../components/addProduct/ProductShippingSection';
import CategoryPickerModal from '../components/addProduct/CategoryPickerModal';
import BrandPickerModal from '../components/addProduct/BrandPickerModal';
import VariationEditorModal from '../components/addProduct/VariationEditorModal';
import AddCategoryModal from '../components/addProduct/AddCategoryModal';
import { sellerApi, SellerCategory, CreateProductVariantPayload } from '../../../lib/sellerApi';

const AddProductScreen: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [weight, setWeight] = useState('');
  const [categories, setCategories] = useState<SellerCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [brand, setBrand] = useState<string>('');
  const [variants, setVariants] = useState<CreateProductVariantPayload[]>([]);
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  const keepDigitsOnly = (value: string) => value.replace(/\D/g, '');
  const formatNumber = (value: string) => {
    const digits = keepDigitsOnly(value);
    if (!digits) {
      return '';
    }
    return Number(digits).toLocaleString('vi-VN');
  };
  const parseNumber = (value: string) => Number(keepDigitsOnly(value) || '0');
  const buildSlug = (input: string) =>
    input
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === selectedCategoryId) || null,
    [categories, selectedCategoryId],
  );

  const loadCategories = async (selectLatest = false) => {
    try {
      setLoadingCategories(true);
      const list = await sellerApi.getCategories();
      const sorted = [...list].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
      setCategories(sorted);
      if (selectLatest && sorted.length > 0) {
        // Find the one with highest ID (most likely the new one)
        const latest = [...sorted].sort((a, b) => b.id - a.id)[0];
        setSelectedCategoryId(latest.id);
      } else if (sorted.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(sorted[0].id);
      }
    } catch (error: unknown) {
      Alert.alert('Không tải được danh mục', error instanceof Error ? error.message : 'Đã xảy ra lỗi.');
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const showComingSoon = (featureName: string) => {
    Alert.alert('Thông báo', `${featureName} sẽ được cập nhật ở bước tiếp theo.`);
  };

  const handlePickCategory = () => {
    if (categories.length === 0) {
      Alert.alert('Danh mục trống', 'Chưa có danh mục nào để chọn.');
      return;
    }
    setShowCategoryModal(true);
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const productPrice = parseNumber(price);
    const productStock = parseNumber(stock);

    if (!trimmedName) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên sản phẩm.');
      return;
    }
    if (productPrice <= 0) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập giá bán lớn hơn 0.');
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn danh mục sản phẩm.');
      return;
    }

    const slugBase = buildSlug(trimmedName);
    const slug = `${slugBase || 'san-pham'}-${Date.now().toString().slice(-6)}`;

    try {
      setSubmitting(true);

      // Upload images first if any
      let uploadedUrls: string[] = [];
      if (images.length > 0) {
        uploadedUrls = await Promise.all(
          images.map(async (uri) => {
            // Only upload if it's a local uri (starts with file:// or content:// or /)
            if (uri.startsWith('http')) return uri;
            return await sellerApi.uploadImage(uri);
          })
        );
      }

      await sellerApi.createProduct({
        categoryId: selectedCategoryId,
        name: trimmedName,
        slug,
        description: description.trim() || undefined,
        price: productPrice,
        stockQuantity: productStock,
        weightGrams: parseNumber(weight) || undefined,
        brand: brand || undefined,
        variants: variants.length > 0 ? variants : undefined,
        imageUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
        originalPrice: undefined,
      });
      Alert.alert('Thành công', 'Đã thêm sản phẩm mới.', [
        { text: 'OK', onPress: () => router.replace('/seller-products') },
      ]);
    } catch (error: unknown) {
      Alert.alert('Thêm sản phẩm thất bại', error instanceof Error ? error.message : 'Đã xảy ra lỗi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AddProductHeader onBackPress={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ProductImagesSection images={images} onImagesChange={setImages} />
        <ProductDetailsSection
          name={name}
          description={description}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          categoryLabel={loadingCategories ? 'Đang tải danh mục...' : selectedCategory?.name || 'Chọn danh mục phù hợp'}
          onPressCategory={handlePickCategory}
          brandLabel={brand || 'Thiết lập thương hiệu (Tùy chọn)'}
          onPressBrand={() => setShowBrandModal(true)}
        />
        <ProductPricingSection
          price={price}
          stock={stock}
          onPriceChange={(value) => setPrice(formatNumber(value))}
          onStockChange={(value) => setStock(formatNumber(value))}
          onPressVariation={() => setShowVariationModal(true)}
          variantSummary={variants.length > 0 ? `${variants.length} phân loại hàng` : undefined}
        />
        <ProductShippingSection
          weight={weight}
          onWeightChange={(value) => setWeight(formatNumber(value))}
          onPressShippingFee={() => showComingSoon('Thiết lập phí vận chuyển')}
        />

        <TouchableOpacity
          style={styles.submitButton}
          activeOpacity={0.9}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>ĐĂNG SẢN PHẨM</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <CategoryPickerModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelect={(cat) => setSelectedCategoryId(cat.id)}
        onAddPress={() => {
          setShowCategoryModal(false);
          setShowAddCategoryModal(true);
        }}
      />

      <BrandPickerModal
        visible={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        selectedBrand={brand}
        onSelect={setBrand}
      />

      <VariationEditorModal
        visible={showVariationModal}
        onClose={() => setShowVariationModal(false)}
        variants={variants}
        onSave={setVariants}
      />

      <AddCategoryModal
        visible={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onSuccess={() => loadCategories(true)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  content: {
    padding: 10,
    paddingBottom: 18,
    gap: 10,
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});

export default AddProductScreen;
