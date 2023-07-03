This test aims to do a full process test to check that methods in the Python SDK concerning the upload of assets and annotations and training models can be run successfully. Methods from this class can be used for testing.

## To import test:
```python
from FullProjectTest import full_process_test
```

## To initialise test:
Eg.
```python
test1 = full_process_test()
test1.initialise_with_secret_key("insert project secret key")
```



The full_process_test class contains the following methods for testing:

## 1. run_img_upload_test("file path to load images from", "file path to download images to")

Sample Output:
```python
{'Test Result': 'Success',
 'Details': {
        'Number of Assets': 500,
        'Upload Status': 'Successful',
        'Download Status': 'Successful',
        'Matching Images': 333,
        'Non-matching Images': 167
    }   
}
```

## 2. run_annot_upload_test("type of annotation file", "file path to load annotations from","file path to export annotations to")

Sample Output:
```python
{'Test Result': 'Success',
 'Details': {
        'Upload Annotations': 'Successful',
        'Export Annotations': 'Successful',
        'Annotation Files Match': False
    }
}
```

## 3. run_vid_upload_test("file path to load videos from", "file path to download videos to")

Sample Output:
```python
{'Test Result': 'Success',
 'Details': {
        'Number of Assets': 500,
        'Upload Status': 'Successful',
        'Download Status': 'Successful',
        'Matching Images': 333,
        'Non-matching Images': 167
    }   
}
```

## 4. run_training_test("file path to export artifacts to")

Sample Output:
```python
{'Test Result': 'Failed',
    'Details': {
        'Start Training': 'Successful',
        'Training Completed': 'Successful',
        'Export Artifact': 'Successful',
        'Artifacts Match': False
    }
}
```
Eg.
1. run_img_upload_test(".\fixture\assets\test_images", ".\fixture\retrieved\retrieved_imgs")
2. run_annot_upload_test("csv_fourcorner", ".\fixture\annotations\test_annotations.csv",".\fixture\retrieved\retrieved_annotations")
3. run_vid_upload_test(".\fixture\assets\test_videos", ".\fixture\retrieved\retrieved_vids")
4. run_training_test(".\fixture\retrieved\retrieved_artifacts")


To add new methods for testing, simply define a new method under the full_process_test class.
