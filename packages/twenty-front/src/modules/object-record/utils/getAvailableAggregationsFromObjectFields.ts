import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { capitalize } from 'twenty-shared';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type NameForAggregation = {
  [T in AGGREGATE_OPERATIONS]?: string;
};

type Aggregations = {
  [key: string]: NameForAggregation;
};

export const getAvailableAggregationsFromObjectFields = (
  fields: FieldMetadataItem[],
): Aggregations => {
  return fields.reduce<Record<string, NameForAggregation>>((acc, field) => {
    if (field.isSystem === true) {
      return acc;
    }

    if (field.type === FieldMetadataType.Relation) {
      acc[field.name] = {
        [AGGREGATE_OPERATIONS.count]: 'totalCount',
      };
      return acc;
    }

    acc[field.name] = {
      [AGGREGATE_OPERATIONS.countUniqueValues]: `countUniqueValues${capitalize(field.name)}`,
      [AGGREGATE_OPERATIONS.countEmpty]: `countEmpty${capitalize(field.name)}`,
      [AGGREGATE_OPERATIONS.countNotEmpty]: `countNotEmpty${capitalize(field.name)}`,
      [AGGREGATE_OPERATIONS.percentageEmpty]: `percentageEmpty${capitalize(field.name)}`,
      [AGGREGATE_OPERATIONS.percentageNotEmpty]: `percentageNotEmpty${capitalize(field.name)}`,
      [AGGREGATE_OPERATIONS.count]: 'totalCount',
    };

    if (field.type === FieldMetadataType.Number) {
      acc[field.name] = {
        ...acc[field.name],
        [AGGREGATE_OPERATIONS.min]: `min${capitalize(field.name)}`,
        [AGGREGATE_OPERATIONS.max]: `max${capitalize(field.name)}`,
        [AGGREGATE_OPERATIONS.avg]: `avg${capitalize(field.name)}`,
        [AGGREGATE_OPERATIONS.sum]: `sum${capitalize(field.name)}`,
      };
    }

    if (field.type === FieldMetadataType.Currency) {
      acc[field.name] = {
        ...acc[field.name],
        [AGGREGATE_OPERATIONS.min]: `min${capitalize(field.name)}AmountMicros`,
        [AGGREGATE_OPERATIONS.max]: `max${capitalize(field.name)}AmountMicros`,
        [AGGREGATE_OPERATIONS.avg]: `avg${capitalize(field.name)}AmountMicros`,
        [AGGREGATE_OPERATIONS.sum]: `sum${capitalize(field.name)}AmountMicros`,
      };
    }

    if (acc[field.name] === undefined) {
      acc[field.name] = {};
    }

    return acc;
  }, {});
};
