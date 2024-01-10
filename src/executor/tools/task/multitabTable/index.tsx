import { IWork, IWorkTask } from '@/ts/core';
import { Empty, Spin } from 'antd';
import React, { useState } from 'react';
import useAsyncLoad from '@/hooks/useAsyncLoad';
import { common, model, schema } from '../../../../ts/base';
import DetailForms from './detail';
import { formatDate } from '@/utils';
import { getNodeByNodeId } from '@/utils/tools';
import { logger } from '@/ts/base/common/logger';
// 卡片渲染
interface IProps {
  current: IWork | IWorkTask;
  finished?: () => void;
  data?: model.InstanceDataModel;
}
const MultitabTable: React.FC<IProps> = ({ current, data, finished }) => {
  const [loaded, apply] = useAsyncLoad(() => current.createApply(undefined, data));
  const [changedFields, setChangedFields] = useState<model.MappingData[]>([]);

  if (!loaded) {
    return (
      <Spin tip={'配置信息加载中...'}>
        <div style={{ width: '100%', height: '100%' }}></div>
      </Spin>
    );
  }
  if (apply) {
    let props = {
      allowEdit: true,
      belong: apply.belong,
      data: apply.instanceData,
      nodeId: apply.instanceData.node.id,
    };
    let node = getNodeByNodeId(props.nodeId, props.data.node);
    const getFormData = (form: schema.XForm): model.FormEditData => {
      var rule: model.RenderRule[] = [];
      const source: schema.XThing[] = [];
      return {
        rules: rule,
        before: [...source],
        after: [...source],
        nodeId: node.id,
        formName: form.name,
        creator: props.belong.userId,
        createTime: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.S'),
      };
    };
    const onValueChanged = (
      id: string,
      data: model.FormEditData,
      field: string,
      _value: any,
      _formType: string,
    ) => {
      props.data.data[id] = [data];
      const refreshFields: model.MappingData[] = [];
      if (refreshFields.length > 0) {
        setChangedFields(refreshFields);
      }
    };
    return (
      <>
        <DetailForms
          {...props}
          changedFields={changedFields}
          forms={node.primaryForms}
          getFormData={getFormData}
          onChanged={(...props) => {
            onValueChanged(...props, '子表');
          }}
        />
      </>
    );
  }
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Empty />
    </div>
  );
};

export default MultitabTable;
