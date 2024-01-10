import { model, schema } from '../../../../ts/base';
import { IBelong } from '@/ts/core';
import { useEffect, useState } from 'react';
import React from 'react';
import { Tabs } from 'antd';
import { EditModal } from '../../editModal';
import CustomStore from 'devextreme/data/custom_store';
import { kernel } from '@/ts/base';
import GenerateThingTable from '../../generate/thingTable';
import { getUuid } from '@/utils/tools';
let json = [
  {
    label: '草稿箱',
    key: '1',
    tableHeader: [{}],
    tableData: [],
    buttonList: [
      {
        name: 'add',
        location: 'after',
        widget: 'dxButton',
        options: {
          text: '新增',
        },
        visible: true,
      },
    ],
  },
  {
    label: '已发起',
    key: '2',
    tableHeader: [{}],
    tableData: [],
    buttonList: [
      {
        name: 'add',
        location: 'after',
        widget: 'dxButton',
        options: {
          text: '编辑',
        },
        visible: true,
      },
    ],
  },
  {
    label: '已办结',
    key: '3',
    tableHeader: [{}],
    tableData: [],
    buttonList: [],
  },
];
interface IProps {
  allowEdit: boolean;
  belong: IBelong;
  forms: schema.XForm[];
  changedFields: model.MappingData[];
  data: model.InstanceDataModel;
  getFormData: (form: schema.XForm) => model.FormEditData;
  onChanged?: (id: string, data: model.FormEditData, field: string, value: any) => void;
  tabCheck: string;
}
// const [toolbarItems, setToolbarItems] = useState<any>();

const DetailTable: React.FC<IProps> = (props) => {
  if (props.forms.length < 1) return <></>;
  const form = props.forms[0];
  if (!props.data.fields[form.id]) return <></>;
  const fields = props.data.fields[form.id];
  const [key, setKey] = useState<string>(form.id);
  const [formData, setFormData] = useState(props.getFormData(form));
  const [selectKeys, setSelectKeys] = useState<string[]>([]);
  console.log('form', form);
  const [toolbarItems, setToolbarItems] = useState<any>({
    visible: true,
    items: [
      {
        name: 'add',
        location: 'after',
        widget: 'dxButton',
        options: {
          text: '新增',
          icon: 'add',
          onClick: () => {},
        },
        visible: true,
      },
    ],
  });
  useEffect(() => {
    let obj = {
      visible: true,
      items: json[props.tabCheck - 1].buttonList,
    };
    setToolbarItems(obj);
  }, [props.tabCheck]);
  useEffect(() => {
    var after = formData.after.at(-1);
    if (after) {
      after.name = form.name;
    }
    props.onChanged?.apply(this, [form.id, formData, '', {}]);
  }, [formData]);
  useEffect(() => {
    if (props.changedFields.find((s) => s.formId == form.id)) {
      setKey(getUuid());
    }
  }, [props.changedFields]);
  return (
    <GenerateThingTable
      key={key}
      fields={fields}
      height={500}
      dataIndex={'attribute'}
      selection={
        props.allowEdit
          ? {
              mode: 'multiple',
              allowSelectAll: true,
              selectAllMode: 'allPages',
              showCheckBoxesMode: 'always',
            }
          : undefined
      }
      onSelectionChanged={(e) => setSelectKeys(e.selectedRowKeys)}
      toolbar={toolbarItems}
      dataSource={
        new CustomStore({
          key: 'id',
          async load(loadOptions) {
            let loadOption: any = loadOptions;
            loadOption.belongId = form.belongId;
            console.log('query', form.belongId, [form.belongId], loadOptions);
            let userId = 'F' + form.id;
            loadOption.userData = [];
            loadOption.userData.push(userId);
            const result = await kernel.loadThing(
              form.belongId,
              [form.belongId],
              loadOptions,
            );
            console.log('result', result);
            return result;
          },
        })
      }
      beforeSource={formData.before}
    />
  );
};

const DetailForms: React.FC<IProps> = (props) => {
  if (props.forms.length < 1) return <></>;
  const [activeTabKey, setActiveTabKey] = useState(json[0].key);
  const loadItems = () => {
    const items: any = [];
    json.forEach((element: any, index: number) => {
      items.push({
        key: element.key,
        forceRender: true,
        label: element.label,
        children: (
          <DetailTable {...props} tabCheck={activeTabKey} forms={[props.forms[0]]} />
        ),
      });
    });
    console.log('items', items);
    return items;
  };
  return (
    <Tabs
      items={loadItems()}
      activeKey={activeTabKey}
      onChange={(key) => setActiveTabKey(key)}
    />
  );
};

export default DetailForms;