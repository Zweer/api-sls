import * as DynamoDB from 'aws-sdk/clients/dynamodb';
import { DataMapper, PutOptions } from '@aws/dynamodb-data-mapper';
import {
  DeleteOptions,
  GetOptions,
  ParallelScanWorkerOptions,
  QueryOptions,
  ScanOptions,
} from '@aws/dynamodb-data-mapper/build/namedParameters';
import { ScanIterator } from '@aws/dynamodb-data-mapper/build/ScanIterator';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { ZeroArgumentsConstructor } from '@aws/dynamodb-data-marshaller';
import {ConditionExpression, ConditionExpressionPredicate} from "@aws/dynamodb-expressions";
import {QueryIterator} from "@aws/dynamodb-data-mapper/build/QueryIterator";

const client = new DynamoDB();
const mapper = new DataMapper({ client });

export class AbstractModel {
  @attribute({ defaultProvider: () => new Date() })
  createdAt: Date;

  @attribute()
  updatedAt: Date;

  static async get<T>(item: T, options?: GetOptions): Promise<T> {
    return mapper.get<T>(item, options);
  }

  static scan<T extends AbstractModel>(
    parameters?: ScanOptions | ParallelScanWorkerOptions,
  ): ScanIterator<T> {
    return mapper.scan<T>(this as any as ZeroArgumentsConstructor<T>, parameters);
  }

  static query<T extends AbstractModel>(keyCondition: ConditionExpression | {
    [propertyName: string]: ConditionExpressionPredicate | any;
  }, options?: QueryOptions): QueryIterator<T> {
    return mapper.query<T>(this as any as ZeroArgumentsConstructor<T>, keyCondition, options);
  }

  async put<T>(options?: PutOptions) {
    this.updatedAt = new Date();

    return mapper.put<T>(this as any, options);
  }

  async destroy<T extends AbstractModel>(
    options?: DeleteOptions,
  ): Promise<T | undefined> {
    return mapper.delete<T>(this as any, options);
  }
}
