import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { computeAggregateValueAndLabel } from '@/object-record/record-board/record-board-column/utils/computeAggregateValueAndLabel';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { FieldMetadataType } from '~/generated/graphql';

const MOCK_FIELD_ID = '7d2d7b5e-7b3e-4b4a-8b0a-7b3e4b4a8b0a';
const MOCK_KANBAN_FIELD_NAME = 'stage';

describe('computeAggregateValueAndLabel', () => {
  const mockObjectMetadata: ObjectMetadataItem = {
    id: '123',
    fields: [
      {
        id: MOCK_FIELD_ID,
        name: 'amount',
        label: 'amount',
        type: FieldMetadataType.Currency,
      } as FieldMetadataItem,
    ],
  } as ObjectMetadataItem;

  it('should return empty object for empty data', () => {
    const result = computeAggregateValueAndLabel({
      data: {},
      objectMetadataItem: mockObjectMetadata,
      fieldMetadataId: MOCK_FIELD_ID,
      aggregateOperation: AGGREGATE_OPERATIONS.sum,
      fallbackFieldName: MOCK_KANBAN_FIELD_NAME,
    });

    expect(result).toEqual({});
  });

  it('should handle currency field with division by 1M', () => {
    const mockData = {
      amount: {
        [AGGREGATE_OPERATIONS.sum]: 2000000,
      },
    };

    const result = computeAggregateValueAndLabel({
      data: mockData,
      objectMetadataItem: mockObjectMetadata,
      fieldMetadataId: MOCK_FIELD_ID,
      aggregateOperation: AGGREGATE_OPERATIONS.sum,
      fallbackFieldName: MOCK_KANBAN_FIELD_NAME,
    });

    expect(result).toEqual({
      value: '2',
      label: 'Sum',
      labelWithFieldName: 'Sum of amount',
    });
  });

  it('should handle number field as percentage', () => {
    const mockObjectMetadataWithPercentageField: ObjectMetadataItem = {
      id: '123',
      fields: [
        {
          id: MOCK_FIELD_ID,
          name: 'percentage',
          label: 'percentage',
          type: FieldMetadataType.Number,
          settings: {
            type: 'percentage',
          },
        } as FieldMetadataItem,
      ],
    } as ObjectMetadataItem;

    const mockData = {
      percentage: {
        [AGGREGATE_OPERATIONS.avg]: 0.3,
      },
    };

    const result = computeAggregateValueAndLabel({
      data: mockData,
      objectMetadataItem: mockObjectMetadataWithPercentageField,
      fieldMetadataId: MOCK_FIELD_ID,
      aggregateOperation: AGGREGATE_OPERATIONS.avg,
      fallbackFieldName: MOCK_KANBAN_FIELD_NAME,
    });

    expect(result).toEqual({
      value: '30%',
      label: 'Average',
      labelWithFieldName: 'Average of percentage',
    });
  });

  it('should handle number field with decimals', () => {
    const mockObjectMetadataWithDecimalsField: ObjectMetadataItem = {
      id: '123',
      fields: [
        {
          id: MOCK_FIELD_ID,
          name: 'decimals',
          label: 'decimals',
          type: FieldMetadataType.Number,
          settings: {
            decimals: 2,
          },
        } as FieldMetadataItem,
      ],
    } as ObjectMetadataItem;

    const mockData = {
      decimals: {
        [AGGREGATE_OPERATIONS.sum]: 0.009,
      },
    };

    const result = computeAggregateValueAndLabel({
      data: mockData,
      objectMetadataItem: mockObjectMetadataWithDecimalsField,
      fieldMetadataId: MOCK_FIELD_ID,
      aggregateOperation: AGGREGATE_OPERATIONS.sum,
      fallbackFieldName: MOCK_KANBAN_FIELD_NAME,
    });

    expect(result).toEqual({
      value: '0.01',
      label: 'Sum',
      labelWithFieldName: 'Sum of decimals',
    });
  });

  it('should default to count when field not found', () => {
    const mockData = {
      [MOCK_KANBAN_FIELD_NAME]: {
        [AGGREGATE_OPERATIONS.count]: 42,
      },
    };

    const result = computeAggregateValueAndLabel({
      data: mockData,
      objectMetadataItem: mockObjectMetadata,
      fallbackFieldName: MOCK_KANBAN_FIELD_NAME,
    });

    expect(result).toEqual({
      value: 42,
      label: 'Count all',
      labelWithFieldName: 'Count all',
    });
  });

  it('should handle undefined aggregate value', () => {
    const mockData = {
      amount: {
        [AGGREGATE_OPERATIONS.sum]: undefined,
      },
    };

    const result = computeAggregateValueAndLabel({
      data: mockData,
      objectMetadataItem: mockObjectMetadata,
      fieldMetadataId: MOCK_FIELD_ID,
      aggregateOperation: AGGREGATE_OPERATIONS.sum,
    });

    expect(result).toEqual({
      value: '-',
      label: 'Sum',
      labelWithFieldName: 'Sum of amount',
    });
  });
});
