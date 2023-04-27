import { XOperation } from '@/ts/base/schema';
import { ISpeciesItem } from '@/ts/core';
import { ProFormColumnsType, ProFormInstance } from '@ant-design/pro-components';
import React, { useRef } from 'react';
import SchemaForm from '@/components/SchemaForm';
import orgCtrl from '@/ts/controller';
import { targetsToTreeData } from '@/pages/Setting';

interface Iprops {
  title: string;
  open: boolean;
  data?: XOperation;
  handleCancel: () => void;
  handleOk: (res: any) => void;
  current: ISpeciesItem;
}
/**
 * 默认备注：表单默认布局
 */
export const defaultRemark: any = {
  type: 'object',
  properties: {},
  labelWidth: 120,
  layout: 'horizontal',
  col: 12,
};

/*
  业务标准编辑模态框
*/
const Modal = ({ open, title, handleOk, data, current, handleCancel }: Iprops) => {
  const formRef = useRef<ProFormInstance>();
  const columns: ProFormColumnsType<XOperation>[] = [
    {
      title: '表单名称',
      dataIndex: 'name',
      formItemProps: {
        rules: [{ required: true, message: '请输入表单名称' }],
      },
    },
    {
      title: '表单代码',
      dataIndex: 'code',
      formItemProps: {
        rules: [{ required: true, message: '请输入表单代码' }],
      },
    },
    {
      title: '选择共享组织',
      dataIndex: 'belongId',
      valueType: 'treeSelect',
      initialValue: current.team.space.id,
      formItemProps: { rules: [{ required: true, message: '请选择共享组织' }] },
      request: async () => {
        const res = await orgCtrl.getTeamTree(current.team.space);
        return targetsToTreeData(res);
      },
      fieldProps: {
        disabled: title === '修改',
        showSearch: true,
      },
    },
    {
      title: '向下级组织公开',
      dataIndex: 'public',
      valueType: 'select',
      fieldProps: {
        options: [
          {
            value: true,
            label: '公开',
          },
          {
            value: false,
            label: '不公开',
          },
        ],
      },
      formItemProps: {
        rules: [{ required: true, message: '请选择是否对下级组织公开' }],
      },
    },
  ];
  return (
    <SchemaForm<XOperation>
      formRef={formRef}
      layoutType="ModalForm"
      width={640}
      title={data?.name || title}
      open={open}
      rowProps={{
        gutter: [24, 0],
      }}
      columns={columns}
      onOpenChange={(open: boolean) => {
        if (open) {
          if (data) {
            formRef.current?.setFieldsValue(data);
          }
        } else {
          formRef.current?.resetFields();
          handleCancel();
        }
      }}
      onFinish={async (values: XOperation) => {
        let success = false;
        if (data) {
          success = await current.updateOperation({
            ...data,
            ...values,
            ...{ remark: JSON.stringify(defaultRemark) },
          });
        } else {
          success = (await current.createOperation(values)) != undefined;
        }
        if (success) {
          handleOk(true);
          formRef.current?.resetFields();
        }
      }}
    />
  );
};

export default Modal;