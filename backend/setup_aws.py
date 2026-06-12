# -*- coding: utf-8 -*-
"""
AWS DynamoDBのセットアップスクリプト。
back2.py が参照する Products / Inventory テーブルを作成し、
ローカル定義の商品データを投入する。

実行: python setup_aws.py
"""
import os
import datetime

import boto3
from botocore.exceptions import ClientError

from back2 import PRODUCTS

REGION          = os.environ.get("AWS_REGION", "ap-northeast-1")
TABLE_INVENTORY = os.environ.get("TABLE_INVENTORY", "Inventory")
TABLE_PRODUCTS  = os.environ.get("TABLE_PRODUCTS", "Products")
STORE_ID        = 1
INITIAL_STOCK   = 10

dynamodb = boto3.resource("dynamodb", region_name=REGION)
client   = boto3.client("dynamodb", region_name=REGION)


def table_exists(name):
    try:
        client.describe_table(TableName=name)
        return True
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceNotFoundException":
            return False
        raise


def create_tables():
    if not table_exists(TABLE_PRODUCTS):
        print(f"テーブル {TABLE_PRODUCTS} を作成中...")
        client.create_table(
            TableName=TABLE_PRODUCTS,
            KeySchema=[{"AttributeName": "product_id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "product_id", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )
    else:
        print(f"テーブル {TABLE_PRODUCTS} は既に存在します")

    if not table_exists(TABLE_INVENTORY):
        print(f"テーブル {TABLE_INVENTORY} を作成中...")
        client.create_table(
            TableName=TABLE_INVENTORY,
            KeySchema=[
                {"AttributeName": "store_id",   "KeyType": "HASH"},
                {"AttributeName": "product_id", "KeyType": "RANGE"},
            ],
            AttributeDefinitions=[
                {"AttributeName": "store_id",   "AttributeType": "N"},
                {"AttributeName": "product_id", "AttributeType": "S"},
            ],
            BillingMode="PAY_PER_REQUEST",
        )
    else:
        print(f"テーブル {TABLE_INVENTORY} は既に存在します")

    print("テーブルがACTIVEになるのを待機中...")
    client.get_waiter("table_exists").wait(TableName=TABLE_PRODUCTS)
    client.get_waiter("table_exists").wait(TableName=TABLE_INVENTORY)
    print("テーブル準備完了")


def seed_data():
    prod_table = dynamodb.Table(TABLE_PRODUCTS)
    inv_table  = dynamodb.Table(TABLE_INVENTORY)
    now        = datetime.datetime.now(datetime.timezone.utc).isoformat()

    print(f"{len(PRODUCTS)}件の商品データを投入中...")
    with prod_table.batch_writer() as batch:
        for p in PRODUCTS:
            batch.put_item(Item={
                "product_id":  p["id"],
                "id":          p["id"],
                "name":        p["name"],
                "price":       p["price"],
                "category":    p["category"],
                "description": p["description"],
                "image":       p["image"],
                "alt":         p["alt"],
                "vector":      p["vector"],
            })

    print(f"店舗{STORE_ID}の在庫データ(各{INITIAL_STOCK}個)を投入中...")
    with inv_table.batch_writer() as batch:
        for p in PRODUCTS:
            batch.put_item(Item={
                "store_id":     STORE_ID,
                "product_id":   p["id"],
                "stock":        INITIAL_STOCK,
                "stock_status": "in_stock",
                "updated_at":   now,
            })

    print("データ投入完了")


def verify():
    prod_count = dynamodb.Table(TABLE_PRODUCTS).scan(Select="COUNT")["Count"]
    inv_count  = dynamodb.Table(TABLE_INVENTORY).scan(Select="COUNT")["Count"]
    print(f"確認: Products={prod_count}件, Inventory={inv_count}件")


if __name__ == "__main__":
    create_tables()
    seed_data()
    verify()
