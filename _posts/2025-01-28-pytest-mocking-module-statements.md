---
layout: post
title: "Pytest: Mocking Module Statements"
---

Let's say we have a Python module with a constant variable or a function decorator on a function we want to test. Those statements are initialized when a module is imported, how can we test them? How can we change them on a test by test basis? In this post, I'm going to show different ways to mock Python module statements.

<!-- more -->

## Modules

In Python, a module is comprised of both statements and definitions. The statements are executed when a module is imported. They help initialize our module and are only executed once. A definition is only executed once it's called (ex. a function or a class). The Python [Modules documentation][python-modules] is helpful for understanding.

How can we initialize a module under test in a different way? How could we change it for each test? In this article, I'm going to show some different ways of mocking statements in modules using Pytest.

## Mocking a Definition

Sometimes a real world example is easier to understand than a simple example. Let's begin with a module named `s3.py` containing utilities for interacting with Amazon S3. Consider our first iteration below.

Note: The contents of `get_all_buckets()` but instead where the client is defined.

{% highlight python linenos %}
# s3.py
from typing import List, Dict

import boto3


def get_all_buckets() -> List[Dict]:
  """ get all S3 buckets in an account """
  s3_client = boto3.client('s3')
  result = []
  response = s3_client.list_buckets()
  result.extend(response['Buckets'])
  while continuationToken := response.get('ContinuationToken'):
    response = s3_client.list_buckets(ContinuationToken=continuationToken)
    result.extend(response['Buckets'])
  return result
 {% endhighlight %}

Let's create a simple test file.

{% highlight python linenos %}
# s3_test.py
from unittest.mock import patch

import pytest

from s3 import get_all_buckets
import s3 as s3_module


@pytest.fixture(autouse=True)
def mock_boto3_client():
    with patch.object(s3_module, 'boto3') as mock:
        yield mock


def test_get_all_objects_when_no_buckets(mock_boto3_client):
    mock_boto3_client.client.return_value.list_buckets.return_value = {'Buckets': []}
    assert get_all_buckets() == []
{% endhighlight %}

This test file runs and executes as expected. Right now, our file under test contains both statements (ex. imports) and definitions (`get_all_buckets()`). When our module is imported then, only the import statements are executed. That allows us to easily mock our S3 client.

## Moving the Client to a Module-Level Constant

Let's say this is to be ran in an AWS Lambda. We want to be careful about how many clients we create, since that increases runtime and cost, so we want to use the same S3 client. One option is to pass around the S3 client as a parameter to our utility function calls. Instead, to simplify our function signatures, we chose to declare a module constant. This means our S3 client has now changes from being in a definition to being a statement.

{% highlight python linenos %}
# s3.py
from typing import List, Dict

import boto3

S3_CLIENT = boto3.client('s3')


def get_all_buckets() -> List[Dict]:
  """ get all S3 buckets in an account """
  result = []
  response = S3_CLIENT.list_buckets()
  result.extend(response['Buckets'])
  while continuationToken := response.get('ContinuationToken'):
    response = S3_CLIENT.list_buckets(ContinuationToken=continuationToken)
    result.extend(response['Buckets'])
  return result
{% endhighlight %}

If we run our test again, you will get a `NoCredentialsError` from `botocore`. This is a clear indication that our client is no longer mocked and is trying to reach out to AWS.

## Mocking an Imported Statement

Remember that statements are only executed once in a model. By the time our `mock_boto3()` fixture executes in our test, the client has already been initialized. The natural question arises, can we initialize `s3.py` on demand? Good news for us, this can be done. The best way I have found is to reload the module in a fixture.

This requires two changes to our mock fixture.

1. Mocking the imported statement where it's defined, rather than where it's used.
2. Using [`importlib.reload`][import-reload] to initialize `s3.py` on demand.

The first change is a violation of typical testing idioms. We almost always (this being an exception) mock a package where it is being used rather than where it is defined. For `s3.py`, we need to mock `boto3` before we import `s3.py`. This violation of norms is what allows us to initialize the `S3_CLIENT` to our mock.

Consider the updated test below.

[python-modules]: https://docs.python.org/3/tutorial/modules.html#more-on-modules
[import-reload]: https://docs.python.org/3/library/importlib.html#importlib.reload
