import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FieldsService } from './fields.service';
import { CustomFieldsService } from './custom-fields.service';
import { FieldDef, FieldDefSchema } from './schemas/field-def.schema';
import { FieldGroup, FieldGroupSchema } from './schemas/field-group.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FieldDef.name, schema: FieldDefSchema },
      { name: FieldGroup.name, schema: FieldGroupSchema },
    ]),
  ],
  providers: [FieldsService, CustomFieldsService],
  exports: [FieldsService, CustomFieldsService],
})
export class FieldsModule {}
