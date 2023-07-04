import React, { useState } from 'react';
import FullScreenModal from '@/executor/tools/fullScreen';
import { IForm } from '@/ts/core';
import * as config from './config';
import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import MainLayout from '@/components/MainLayout';
import useMenuUpdate from '@/hooks/useMenuUpdate';
import GenerateTable from '@/executor/tools/generate/table';
import CustomStore from 'devextreme/data/custom_store';
import { kernel, schema } from '@/ts/base';
import { ImCopy, ImShuffle, ImTicket } from 'react-icons/im';
import orgCtrl, { Controller } from '@/ts/controller';
import { message } from 'antd';
import ThingView from './detail';

interface IProps {
  form: IForm;
  finished: () => void;
}

/** 表单查看 */
const FormView: React.FC<IProps> = ({ form, finished }) => {
  const [key, rootMenu, selectMenu, setSelectMenu] = useMenuUpdate(
    () => config.loadSpeciesItemMenu(form),
    new Controller(form.key),
  );
  const [archives, setArchives] = useState<schema.XWorkInstance[]>([]);
  if (!selectMenu || !rootMenu) return <></>;
  const loadContent = () => {
    if (archives.length > 0) {
      return <ThingView archives={archives} onBack={() => setArchives([])} />;
    }
    return (
      <GenerateTable
        key={key}
        autoColumn
        height={'100%'}
        form={form.metadata}
        fields={form.fields}
        onRowDblClick={async (e: any) => {
          const archs: schema.XWorkInstance[] = [];
          for (const archive of Object.values(
            e.data.Archives,
          ) as schema.XWorkInstance[]) {
            archs.push(
              (await orgCtrl.work.loadInstanceDetail(archive.id, archive.belongId)) ||
              archive,
            );
          }
          setArchives(archs);
        }}
        dataSource={
          new CustomStore({
            key: 'Id',
            async load(loadOptions) {
              const item = selectMenu.item?.value;
              loadOptions.userData = item ? [item] : [];
              let request: any = { ...loadOptions };
              const result = await kernel.anystore.loadThing<any>(form.belongId, request);
              if (result.success) {
                return result.data;
              }
              return [];
            },
          })
        }
        remoteOperations={true}
        columnChooser={{ enabled: true }}
        toolbar={{
          visible: true,
          items: [
            {
              name: 'columnChooserButton',
              location: 'after',
            },
            {
              name: 'searchPanel',
              location: 'after',
            },
          ],
        }}
        dataMenus={{
          items: [
            {
              key: 'createNFT',
              label: '生成存证',
              icon: <ImTicket fontSize={22} color={'#9498df'} />,
              onClick: () => {
                message.success('存证成功!');
              },
            },
            {
              key: 'copyBoard',
              label: '复制数据',
              icon: <ImCopy fontSize={22} color={'#9498df'} />,
            },
            {
              key: 'startWork',
              label: '发起办事',
              icon: <ImShuffle fontSize={22} color={'#9498df'} />,
            },
          ],
          onMenuClick(key, data) {
            console.log(key, data);
          },
        }}
        hideColumns={['Creater', 'CreateTime', 'ModifiedTime']}
      />
    );
  };
  return (
    <FullScreenModal
      centered
      open={true}
      fullScreen
      width={'80vw'}
      title={form.name}
      bodyHeight={'80vh'}
      icon={<EntityIcon entityId={form.id} />}
      destroyOnClose
      onCancel={() => finished()}>
      <MainLayout
        notExitIcon
        selectMenu={selectMenu}
        onSelect={(data) => {
          setSelectMenu(data);
        }}
        siderMenuData={rootMenu}>
        {loadContent()}
      </MainLayout>
    </FullScreenModal>
  );
};

export default FormView;
