import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile: {
        type : String,
        requried : true,
    },
    thumbnail : {
        type : String,
        requried : true,
    },
    title : {
        type : String,
        requried : true,
    },
    description : {
        type : String,
        requried : true,
    },
    duration : {
        type : Number, // Cloudinary provides
        requried : true,
    },
    views : {
        type : String,
        default : 0
    },
    isPublished : {
        type : Boolean,
        defalt: true
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})

videoSchema.plugin(mongooseAggregatePaginate)

export const VideoSchema = mongoose.models("VideoSchema", videoSchema)