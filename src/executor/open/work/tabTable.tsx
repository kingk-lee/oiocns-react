import { IWork } from '@/ts/core';
import React, { useState } from 'react';
import FullScreenModal from '@/components/Common/fullScreen';
import MultitabTable from '@/executor/tools/task/multitabTable';
import TaskStart from '@/executor/tools/task/start';
import { model } from '@/ts/base';

interface IProps {
  current: IWork;
  finished: () => void;
  data?: model.InstanceDataModel;
}

/** 办事-业务流程--发起 */
const TabTable: React.FC<IProps> = ({ current, finished, data }) => {
  const [activeKey] = useState('1');
  const rule = current.metadata.rule
    ? JSON.parse(current.metadata.rule)
    : { applyType: '默认' };
  const title = current.name;
  return (
    <FullScreenModal
      open
      centered
      fullScreen
      width={'80vw'}
      bodyHeight={'80vh'}
      destroyOnClose
      title={title}
      footer={[]}
      onCancel={finished}>
      {rule.applyType === '列表' ? (
        <MultitabTable
          current={current}
          finished={finished}
          data={data}
          activeKey={activeKey}
        />
      ) : (
        <TaskStart current={current} finished={finished} data={data} />
      )}
    </FullScreenModal>
  );
};

export default TabTable;
