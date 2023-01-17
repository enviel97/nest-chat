import { HydratedDocument, Model, Schema } from 'mongoose';
import { ModelName } from 'src/common/define';

export type ParticipantDocument = Model<HydratedDocument<Participant<string>>>;

const ParticipantSchema = new Schema<Participant<string>>(
  {
    members: { type: [String], ref: ModelName.User, required: true, index: 1 },
    roles: { type: Map, of: String, required: true },
  },
  { timestamps: true },
);

export default { name: ModelName.Participant, schema: ParticipantSchema };
