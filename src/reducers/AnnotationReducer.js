import AnnotationActions from "../actions/AnnotationActions";
import axios from "axios";

const AnnotationReducers = (state, action) => {
    switch (action.type) {
        case AnnotationActions.GET_ALL_VIDEOS:
            let data;
            const getValue = async () => {
                await axios
                    .get("http://localhost:4000/videos")
                    .then((res) => {
                        return res.data;
                    })
                    .catch((err) => {
                        return state;
                    });
            };

            return getValue();
        default:
            return state;
    }
};

export default AnnotationReducers;
