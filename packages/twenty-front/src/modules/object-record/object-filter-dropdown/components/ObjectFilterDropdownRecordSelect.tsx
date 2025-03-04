import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectFilterDropdownRecordPinnedItems } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordPinnedItems';
import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from '@/object-record/object-filter-dropdown/constants/CurrentWorkspaceMemberSelectableItemId';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { MultipleSelectDropdown } from '@/object-record/select/components/MultipleSelectDropdown';
import { useRecordsForSelect } from '@/object-record/select/hooks/useRecordsForSelect';
import { SelectableItem } from '@/object-record/select/types/SelectableItem';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { RelationFilterValue } from '@/views/view-filter-value/types/RelationFilterValue';
import { relationFilterValueSchema } from '@/views/view-filter-value/validation-schemas/relationFilterValueSchema';
import { IconUserCircle } from 'twenty-ui';
import { isDefined } from '~/utils/isDefined';

export const EMPTY_FILTER_VALUE: string = JSON.stringify({
  isCurrentWorkspaceMemberSelected: false,
  selectedRecordIds: [],
} satisfies RelationFilterValue);

export const MAX_RECORDS_TO_DISPLAY = 3;

type ObjectFilterDropdownRecordSelectProps = {
  viewComponentId?: string;
};

export const ObjectFilterDropdownRecordSelect = ({
  viewComponentId,
}: ObjectFilterDropdownRecordSelectProps) => {
  const {
    filterDefinitionUsedInDropdownState,
    objectFilterDropdownSearchInputState,
    selectedOperandInDropdownState,
    selectedFilterState,
    objectFilterDropdownSelectedRecordIdsState,
    selectFilter,
  } = useFilterDropdown();

  const { currentViewWithCombinedFiltersAndSorts } =
    useGetCurrentView(viewComponentId);

  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
  );
  const objectFilterDropdownSearchInput = useRecoilValue(
    objectFilterDropdownSearchInputState,
  );
  const selectedOperandInDropdown = useRecoilValue(
    selectedOperandInDropdownState,
  );
  const objectFilterDropdownSelectedRecordIds = useRecoilValue(
    objectFilterDropdownSelectedRecordIdsState,
  );
  const [fieldId] = useState(v4());

  const selectedFilter = useRecoilValue(selectedFilterState);

  const { isCurrentWorkspaceMemberSelected } = relationFilterValueSchema
    .catch({
      isCurrentWorkspaceMemberSelected: false,
      selectedRecordIds: [],
    })
    .parse(selectedFilter?.value);

  const objectNameSingular =
    filterDefinitionUsedInDropdown?.relationObjectMetadataNameSingular;

  if (!isDefined(objectNameSingular)) {
    throw new Error('relationObjectMetadataNameSingular is not defined');
  }

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: objectNameSingular,
  });

  const objectLabelPlural = objectMetadataItem?.labelPlural;

  if (!isDefined(objectNameSingular)) {
    throw new Error('objectNameSingular is not defined');
  }

  const { loading, filteredSelectedRecords, recordsToSelect, selectedRecords } =
    useRecordsForSelect({
      searchFilterText: objectFilterDropdownSearchInput,
      selectedIds: objectFilterDropdownSelectedRecordIds,
      objectNameSingular,
      limit: 10,
    });

  const currentWorkspaceMemberSelectableItem: SelectableItem = {
    id: CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID,
    name: 'Me',
    isSelected: isCurrentWorkspaceMemberSelected ?? false,
    AvatarIcon: IconUserCircle,
  };

  const pinnedSelectableItems: SelectableItem[] =
    objectNameSingular === 'workspaceMember'
      ? [currentWorkspaceMemberSelectableItem]
      : [];

  const filteredPinnedSelectableItems = pinnedSelectableItems.filter((item) =>
    item.name
      .toLowerCase()
      .includes(objectFilterDropdownSearchInput.toLowerCase()),
  );

  const handleMultipleRecordSelectChange = (
    itemToSelect: SelectableItem,
    isNewSelectedValue: boolean,
  ) => {
    if (loading) {
      return;
    }

    const isItemCurrentWorkspaceMember =
      itemToSelect.id === CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID;

    const selectedRecordIdsWithAddedRecord = [
      ...objectFilterDropdownSelectedRecordIds,
      itemToSelect.id,
    ];
    const selectedRecordIdsWithRemovedRecord =
      objectFilterDropdownSelectedRecordIds.filter(
        (id) => id !== itemToSelect.id,
      );

    const newSelectedRecordIds = isItemCurrentWorkspaceMember
      ? objectFilterDropdownSelectedRecordIds
      : isNewSelectedValue
        ? selectedRecordIdsWithAddedRecord
        : selectedRecordIdsWithRemovedRecord;

    const newIsCurrentWorkspaceMemberSelected = isItemCurrentWorkspaceMember
      ? isNewSelectedValue
      : isCurrentWorkspaceMemberSelected;

    const selectedRecordNames = [
      ...recordsToSelect,
      ...selectedRecords,
      ...filteredSelectedRecords,
    ]
      .filter(
        (record, index, self) =>
          self.findIndex((r) => r.id === record.id) === index,
      )
      .filter((record) => newSelectedRecordIds.includes(record.id))
      .map((record) => record.name);

    const selectedPinnedItemNames = newIsCurrentWorkspaceMemberSelected
      ? [currentWorkspaceMemberSelectableItem.name]
      : [];

    const selectedItemNames = [
      ...selectedPinnedItemNames,
      ...selectedRecordNames,
    ];

    const filterDisplayValue =
      selectedItemNames.length > MAX_RECORDS_TO_DISPLAY
        ? `${selectedItemNames.length} ${objectLabelPlural.toLowerCase()}`
        : selectedItemNames.join(', ');

    if (
      isDefined(filterDefinitionUsedInDropdown) &&
      isDefined(selectedOperandInDropdown)
    ) {
      const newFilterValue =
        newSelectedRecordIds.length > 0 || newIsCurrentWorkspaceMemberSelected
          ? JSON.stringify({
              isCurrentWorkspaceMemberSelected:
                newIsCurrentWorkspaceMemberSelected,
              selectedRecordIds: newSelectedRecordIds,
            } satisfies RelationFilterValue)
          : '';

      const viewFilter =
        currentViewWithCombinedFiltersAndSorts?.viewFilters.find(
          (viewFilter) =>
            viewFilter.fieldMetadataId ===
            filterDefinitionUsedInDropdown.fieldMetadataId,
        );

      const filterId = viewFilter?.id ?? fieldId;

      selectFilter({
        id: selectedFilter?.id ? selectedFilter.id : filterId,
        definition: filterDefinitionUsedInDropdown,
        operand: selectedOperandInDropdown,
        displayValue: filterDisplayValue,
        fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
        value: newFilterValue,
        viewFilterGroupId: selectedFilter?.viewFilterGroupId,
      });
    }
  };

  return (
    <>
      {filteredPinnedSelectableItems.length > 0 && (
        <>
          <ObjectFilterDropdownRecordPinnedItems
            selectableItems={filteredPinnedSelectableItems}
            onChange={handleMultipleRecordSelectChange}
          />
          <DropdownMenuSeparator />
        </>
      )}
      <MultipleSelectDropdown
        selectableListId="object-filter-record-select-id"
        hotkeyScope={RelationPickerHotkeyScope.RelationPicker}
        itemsToSelect={recordsToSelect}
        filteredSelectedItems={filteredSelectedRecords}
        selectedItems={selectedRecords}
        onChange={handleMultipleRecordSelectChange}
        searchFilter={objectFilterDropdownSearchInput}
        loadingItems={loading}
      />
    </>
  );
};
