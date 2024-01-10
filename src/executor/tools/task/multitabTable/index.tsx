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
    console.log('data', props.data);
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
      const vaildRule = (rules: any[]): boolean => {
        var pass: boolean = false;
        if (rules.includes('and') || rules.includes('or')) {
          var operate = 'and';
          var result: boolean[] = [];
          for (const rule of rules) {
            if (Array.isArray(rule)) {
              result.push(vaildRule(rule));
            } else if (['and', 'or'].includes(rule)) {
              operate = rule;
            }
          }
          return operate == 'and' ? !result.includes(false) : result.includes(true);
        } else {
          const triggers = (rules[0] as string).split('-');
          if (triggers.length == 2) {
            const dataValue = props.data.data[triggers[0]].at(-1)?.after[0][triggers[1]];
            if (rules.length == 3) {
              if (dataValue) {
                switch (rules[1]) {
                  case '=':
                    return dataValue == rules[2];
                  case '<>':
                    return dataValue != rules[2];
                  case '>':
                    return dataValue > rules[2];
                  case '>=':
                    return dataValue >= rules[2];
                  case '<':
                    return dataValue < rules[2];
                  case '<=':
                    return dataValue <= rules[2];
                  case 'contains':
                    return `${dataValue}`.includes(rules[2]);
                  case 'notcontains':
                    return !`${dataValue}`.includes(rules[2]);
                  case 'startswith':
                    return `${dataValue}`.startsWith(rules[2]);
                  case 'endswith':
                    return `${dataValue}`.endsWith(rules[2]);
                  case 'isblank':
                    return `${dataValue}`.trim().length == 0;
                  case 'isnotblank':
                    return `${dataValue}`.trim().length > 0;
                  case 'between':
                    if (Array.isArray(rules[2]) && rules[2].length == 2) {
                      return dataValue > rules[2][0] && dataValue <= rules[2][1];
                    }
                    break;
                  default:
                    break;
                }
              }
            } else if (rules.length == 2) {
              switch (rules[1]) {
                case 'isblank':
                  return dataValue == undefined;
                case 'isnotblank':
                  return dataValue != undefined;
                default:
                  break;
              }
            }
          }
        }
        return pass;
      };
      const trigger = field == '' ? id : field;
      const rules = (node.formRules || []).filter(
        (a) => a.trigger.includes(trigger) || a.trigger.includes(id + '-' + field),
      );
      for (const rule of rules) {
        switch (rule.type) {
          case 'show':
            {
              var showRule = rule as model.NodeShowRule;
              var pass = vaildRule(JSON.parse(showRule.condition));
              const oldRule = props.data.rules.find(
                (a) => a.destId == showRule.target.id && a.typeName == showRule.showType,
              );
              if (oldRule) {
                oldRule.value = pass ? showRule.value : !showRule.value;
              } else {
                props.data.rules.push({
                  formId: showRule.target.formId,
                  destId: showRule.target.id,
                  typeName: showRule.showType,
                  value: pass ? showRule.value : !showRule.value,
                });
              }
              refreshFields.push(showRule.target);
            }
            break;
          case 'calc':
            var calcRule = rule as model.NodeCalcRule;
            var formula = calcRule.formula;
            try {
              var runtime: any = {
                target: {},
              };
              var isLegal = true;
              calcRule.mappingData.forEach((s) => {
                switch (s.typeName) {
                  case '对象':
                    {
                      const value = props.data.data[s.formId].at(-1)?.after[0][s.id];
                      if (!value) {
                        isLegal = false;
                      }
                      runtime[s.code] = value;
                    }
                    break;
                  case '集合':
                    {
                      const value = props.data.data[s.formId]
                        .at(-1)
                        ?.after.map((a) => a[s.id]);
                      if (value && value.length > 0) {
                        runtime[s.code] = value;
                      } else {
                        isLegal = false;
                      }
                    }
                    runtime[s.code] = props.data.data[s.formId]
                      .at(-1)
                      ?.after.map((a) => a[s.id]);
                    break;
                  default:
                    break;
                }
              });
              if (isLegal) {
                common.Sandbox(`target = ${calcRule.formula}`)(runtime);
                var target = props.data.data[calcRule.target.formId].at(-1);
                if (target && target.after[0][calcRule.target.id] != runtime.target) {
                  target.after[0][calcRule.target.id] = runtime.target;
                  refreshFields.push(calcRule.target);
                }
              }
            } catch {
              logger.error(`计算规则[${formula}]执行失败，请确认是否维护正确!`);
            }
            break;
          case 'executor':
            break;
          default:
            break;
        }
      }
      if (refreshFields.length > 0) {
        setChangedFields(refreshFields);
      }
    };
    return (
      <>
        <DetailForms
          {...props}
          changedFields={changedFields}
          forms={node.detailForms}
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
