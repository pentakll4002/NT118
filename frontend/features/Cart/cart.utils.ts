import { CartSectionType, CartSummaryType } from './cart.types';

export const formatPrice = (value: number) => {
  return `₫${value.toLocaleString('vi-VN')}`;
};

export const getCartSummary = (
  sections: CartSectionType[],
): CartSummaryType => {
  let totalPrice = 0;
  let selectedCount = 0;

  const allItems = sections.flatMap(section => section.items);
  const selectableItems = allItems.filter(item => !item.disabled);

  allItems.forEach(item => {
    if (item.checked && !item.disabled) {
      totalPrice += item.price * item.quantity;
      selectedCount += item.quantity;
    }
  });

  const allChecked =
    selectableItems.length > 0 &&
    selectableItems.every(item => item.checked);

  return {
    totalPrice,
    selectedCount,
    allChecked,
  };
};

export const toggleShopChecked = (
  sections: CartSectionType[],
  shopId: string,
): CartSectionType[] => {
  return sections.map(section => {
    if (section.shopId !== shopId) return section;

    const selectableItems = section.items.filter(item => !item.disabled);
    const isCurrentlyAllChecked =
      selectableItems.length > 0 &&
      selectableItems.every(item => item.checked);

    const nextChecked = !isCurrentlyAllChecked;

    return {
      ...section,
      checked: nextChecked,
      items: section.items.map(item =>
        item.disabled
          ? item
          : {
              ...item,
              checked: nextChecked,
            },
      ),
    };
  });
};

export const toggleItemChecked = (
  sections: CartSectionType[],
  shopId: string,
  itemId: string,
): CartSectionType[] => {
  return sections.map(section => {
    if (section.shopId !== shopId) return section;

    const nextItems = section.items.map(item => {
      if (item.id !== itemId || item.disabled) return item;
      return {
        ...item,
        checked: !item.checked,
      };
    });

    const selectableItems = nextItems.filter(item => !item.disabled);
    const shopChecked =
      selectableItems.length > 0 &&
      selectableItems.every(item => item.checked);

    return {
      ...section,
      checked: shopChecked,
      items: nextItems,
    };
  });
};

export const updateItemQuantity = (
  sections: CartSectionType[],
  shopId: string,
  itemId: string,
  type: 'increase' | 'decrease',
): CartSectionType[] => {
  return sections.map(section => {
    if (section.shopId !== shopId) return section;

    return {
      ...section,
      items: section.items.map(item => {
        if (item.id !== itemId || item.disabled) return item;

        if (type === 'increase') {
          return {
            ...item,
            quantity: item.quantity + 1,
          };
        }

        return {
          ...item,
          quantity: Math.max(1, item.quantity - 1),
        };
      }),
    };
  });
};

export const toggleAllChecked = (
  sections: CartSectionType[],
): CartSectionType[] => {
  const allItems = sections.flatMap(section => section.items);
  const selectableItems = allItems.filter(item => !item.disabled);

  const isAllChecked =
    selectableItems.length > 0 &&
    selectableItems.every(item => item.checked);

  const nextChecked = !isAllChecked;

  return sections.map(section => {
    const nextItems = section.items.map(item =>
      item.disabled
        ? item
        : {
            ...item,
            checked: nextChecked,
          },
    );

    const selectableShopItems = nextItems.filter(item => !item.disabled);
    const shopChecked =
      selectableShopItems.length > 0 &&
      selectableShopItems.every(item => item.checked);

    return {
      ...section,
      checked: shopChecked,
      items: nextItems,
    };
  });
};