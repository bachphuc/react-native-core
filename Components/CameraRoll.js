
import CameraRollNative from '@react-native-community/cameraroll';

class CameraRollHandler{
    getPhotos(){
        return new Promise((resolve, reject) => {
            CameraRollNative.getPhotos({
                first: 12,
            }).then((response) => {
                resolve(response);
            })
            .catch(err => {
                reject(err);
            })
        });
    }
}

const CameraRoll = new CameraRollHandler();

export default CameraRoll;