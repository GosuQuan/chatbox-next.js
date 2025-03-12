'use client'

import { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Select, InputNumber, Radio, Slider, Typography, Space, Divider, App, Row, Col, Tooltip } from 'antd'
import { UserOutlined, BankOutlined, ClockCircleOutlined, EnvironmentOutlined, TeamOutlined, TrophyOutlined, DollarOutlined, CalendarOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

const { Title, Paragraph, Text } = Typography
const { Option } = Select

// 城市等级映射
const CITY_TIERS = {
  first: ['北京', '上海', '广州', '深圳'],
  second: ['杭州', '南京', '武汉', '西安', '成都', '重庆', '苏州', '天津', '长沙', '郑州', '东莞', '青岛', '沈阳', '宁波', '昆明']
}

// 评分权重 - 调整为更注重薪资和工作时间
const WEIGHTS = {
  salary: 25,        // 税前年薪 25% (提高)
  workHours: 20,     // 每日工作时间 20% (提高)
  vacation: 10,      // 年假天数 10%
  commute: 10,       // 通勤时间 10%
  cityTier: 10,      // 城市等级 10%
  colleagues: 10,    // 同事素质 10%
  companySize: 5,    // 公司规模 5% (降低)
  benefits: 5,       // 每日福利价值 5% (降低)
  education: 5       // 学历与人均学历匹配 5% (降低)
}

interface WlbForm {
  age: number
  education: string
  salary: number
  workHours: number
  vacation: number
  commuteTime: number
  city: string
  benefits: number
  colleaguesAppearance: number
  colleaguesCompetence: number
  colleaguesEducation: string
  yourEducation: string
  companySize: string
  [key: string]: string | number | undefined
}

// 字段标签映射
const fieldLabels: Record<string, string> = {
  age: '年龄',
  education: '您的学历',
  salary: '税前年薪',
  workHours: '每日工作时间',
  vacation: '年假天数',
  commuteTime: '单程通勤时间',
  city: '所在城市',
  benefits: '每日福利价值',
  colleaguesAppearance: '公司里面的人好看吗',
  colleaguesCompetence: '同事偏优秀还是偏蠢',
  colleaguesEducation: '公司人均学历',
  companySize: '公司规模'
};

// 必填字段列表
const requiredFields = [
  'age', 'education', 'salary', 'workHours', 'vacation', 
  'commuteTime', 'city', 'benefits', 'colleaguesAppearance', 
  'colleaguesCompetence', 'colleaguesEducation', 'companySize'
] as const;

export default function WlbPage() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm<WlbForm>()
  const [score, setScore] = useState<number | null>(null)
  const [scoreDetails, setScoreDetails] = useState<any>(null)
  const [extremeMessage, setExtremeMessage] = useState<string | null>(null)
  const { message } = App.useApp()
  const [cityTier, setCityTier] = useState<'first' | 'second' | 'other'>('first')
  const [formValues, setFormValues] = useState<Partial<WlbForm>>({})

  // 监听城市变化，更新城市等级
  const handleCityChange = (city: string) => {
    if (CITY_TIERS.first.includes(city)) {
      setCityTier('first')
    } else if (CITY_TIERS.second.includes(city)) {
      setCityTier('second')
    } else {
      setCityTier('other')
    }
    
    // 更新表单值并触发评分计算
    const currentValues = form.getFieldsValue();
    currentValues.city = city;
    updateScore(currentValues);
  }

  // 更新评分计算
  const updateScore = (values: Partial<WlbForm>) => {
    setFormValues(prev => ({...prev, ...values}));
    
    // 检查是否所有必填字段都已填写
    const missingFields = requiredFields.filter(field => {
      const value = values[field];
      return value === undefined || value === null || value === '';
    });
    
    if (missingFields.length === 0) {
      // 所有字段已填写，计算评分
      const { totalScore, details } = calculateScore(values as WlbForm);
      setScore(totalScore);
      setScoreDetails(details);
      
      // 处理极端情况
      if ('extremeCase' in details && details.extremeCase) {
        setExtremeMessage(details.message);
      } else {
        setExtremeMessage(null);
      }
    } else {
      // 有字段未填写，设置空结果并显示提示
      setScore(null);
      setScoreDetails({
        missingFields: missingFields.map(field => fieldLabels[field] || field)
      });
    }
  }
  
  // 表单值变化时触发
  const onChange = (_changedValues: any, allValues: WlbForm) => {
    updateScore(allValues);
  }

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '900px' }}
      >
        <Card 
          title={
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>这B班你上的值不值</Title>
              <Paragraph type="secondary">
                根据您的工作与生活情况，评估您当前工作的性价比和幸福指数
              </Paragraph>
            </div>
          }
          style={{ 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            marginBottom: '20px'
          }}
        >
          <Form
            form={form}
            name="wlb"
            layout="vertical"
            requiredMark="optional"
            onValuesChange={onChange}
            onFinish={updateScore}
          >
            <Divider orientation="left">基本信息</Divider>
            
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="age"
                  label="年龄"
                  rules={[{ required: true, message: '请输入您的年龄' }]}
                >
                  <InputNumber
                    min={18}
                    max={65}
                    style={{ width: '100%' }}
                    placeholder="请输入您的年龄"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="education"
                  label="您的学历"
                  rules={[{ required: true, message: '请选择您的学历' }]}
                >
                  <Select placeholder="请选择您的学历">
                    <Option value="highSchool">高中及以下</Option>
                    <Option value="college">大专</Option>
                    <Option value="bachelor">本科</Option>
                    <Option value="master">硕士</Option>
                    <Option value="phd">博士及以上</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="colleaguesEducation"
                  label="公司人均学历"
                  rules={[{ required: true, message: '请选择公司人均学历' }]}
                >
                  <Select placeholder="请选择公司人均学历">
                    <Option value="highSchool">高中及以下</Option>
                    <Option value="college">大专</Option>
                    <Option value="bachelor">本科</Option>
                    <Option value="master">硕士</Option>
                    <Option value="phd">博士及以上</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">薪资与福利</Divider>
            
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="salary"
                  label="税前年薪（万元）"
                  rules={[{ required: true, message: '请输入您的税前年薪' }]}
                >
                  <InputNumber
                    min={1}
                    max={1000}
                    precision={1}
                    style={{ width: '100%' }}
                    placeholder="请输入您的税前年薪（万元）"
                    prefix={<DollarOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="benefits"
                  label="每日福利价值（元）"
                  rules={[{ required: true, message: '请输入每日福利价值' }]}
                >
                  <InputNumber
                    min={0}
                    max={1000}
                    style={{ width: '100%' }}
                    placeholder="请输入每日福利价值（元）"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="workHours"
                  label="每日工作时间（小时）"
                  rules={[{ required: true, message: '请输入每日工作时间' }]}
                >
                  <InputNumber
                    min={4}
                    max={16}
                    style={{ width: '100%' }}
                    placeholder="请输入每日工作时间"
                    prefix={<ClockCircleOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="vacation"
                  label="年假天数"
                  rules={[{ required: true, message: '请输入年假天数' }]}
                >
                  <InputNumber
                    min={0}
                    max={30}
                    style={{ width: '100%' }}
                    placeholder="请输入年假天数"
                    prefix={<CalendarOutlined />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">工作环境</Divider>
            
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="city"
                  label="所在城市"
                  rules={[{ required: true, message: '请选择所在城市' }]}
                >
                  <Select 
                    placeholder="请选择所在城市"
                    onChange={handleCityChange}
                    showSearch
                    optionFilterProp="children"
                  >
                    <Option value="北京">北京</Option>
                    <Option value="上海">上海</Option>
                    <Option value="广州">广州</Option>
                    <Option value="深圳">深圳</Option>
                    <Option value="杭州">杭州</Option>
                    <Option value="南京">南京</Option>
                    <Option value="武汉">武汉</Option>
                    <Option value="西安">西安</Option>
                    <Option value="成都">成都</Option>
                    <Option value="重庆">重庆</Option>
                    <Option value="苏州">苏州</Option>
                    <Option value="天津">天津</Option>
                    <Option value="长沙">长沙</Option>
                    <Option value="郑州">郑州</Option>
                    <Option value="东莞">东莞</Option>
                    <Option value="青岛">青岛</Option>
                    <Option value="沈阳">沈阳</Option>
                    <Option value="宁波">宁波</Option>
                    <Option value="昆明">昆明</Option>
                    <Option value="其他">其他</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="commuteTime"
                  label="单程通勤时间（分钟）"
                  rules={[{ required: true, message: '请输入单程通勤时间' }]}
                >
                  <InputNumber
                    min={0}
                    max={180}
                    style={{ width: '100%' }}
                    placeholder="请输入单程通勤时间"
                    prefix={<EnvironmentOutlined />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="companySize"
                  label="公司规模"
                  rules={[{ required: true, message: '请选择公司规模' }]}
                >
                  <Select placeholder="请选择公司规模">
                    <Option value="startup">初创公司（50人以下）</Option>
                    <Option value="small">小型公司（50-200人）</Option>
                    <Option value="medium">中型公司（200-1000人）</Option>
                    <Option value="large">大型公司（1000-5000人）</Option>
                    <Option value="enterprise">大型企业（5000人以上）</Option>
                    <Option value="giant">互联网巨头（如BAT、字节跳动等）</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="colleaguesAppearance"
                  label="公司里面的人好看吗"
                  rules={[{ required: true, message: '请评价同事颜值' }]}
                >
                  <Radio.Group>
                    <Radio value={1}>很一般</Radio>
                    <Radio value={2}>还行</Radio>
                    <Radio value={3}>颜值在线</Radio>
                    <Radio value={4}>非常好看</Radio>
                    <Radio value={5}>明星级别</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="colleaguesCompetence"
              label="同事偏优秀还是偏蠢"
              rules={[{ required: true, message: '请评价同事能力' }]}
            >
              <Slider
                marks={{
                  1: '很差',
                  3: '一般',
                  5: '优秀',
                  7: '精英',
                  10: '天才'
                }}
                min={1}
                max={10}
                step={1}
              />
            </Form.Item>

          </Form>

          {score !== null && scoreDetails && !scoreDetails.missingFields ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card
                style={{ 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  marginTop: '20px'
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <Title level={3}>你的B班评分结果</Title>
                  {extremeMessage ? (
                    <>
                      <Title level={1} style={{ color: score > 1000 ? '#52c41a' : '#f5222d' }}>
                        {score.toFixed(1)}
                      </Title>
                      <Paragraph style={{ fontSize: '18px', fontWeight: 'bold' }}>
                        {extremeMessage}
                      </Paragraph>
                    </>
                  ) : (
                    <>
                      <Title level={1} style={{ color: getScoreColor(score) }}>{score.toFixed(1)}</Title>
                      <Paragraph>
                        {getScoreDescription(score)}
                      </Paragraph>
                    </>
                  )}
                </div>
              </Card>
            </motion.div>
          ) : scoreDetails && scoreDetails.missingFields ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card
                style={{ 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  marginTop: '20px',
                  backgroundColor: '#fff2f0'
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <Title level={4} style={{ color: '#f5222d' }}>请完成以下字段以查看评分结果</Title>
                  <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
                    {scoreDetails.missingFields.map((field: string, index: number) => (
                      <li key={index}>{field}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          ) : null}
        </Card>
      </motion.div>
    </div>
  )
}

// 根据分数获取颜色 - 降低评分要求
function getScoreColor(score: number): string {
  if (score >= 70) return '#52c41a' // 绿色 - 很好
  if (score >= 50) return '#1890ff' // 蓝色 - 还可以
  if (score >= 30) return '#faad14' // 黄色 - 一般
  return '#f5222d' // 红色 - 差
}

// 根据分数获取描述 - 关注工作性价比，更主观情绪化，降低评分要求
function getScoreDescription(score: number): string {
  if (score >= 90) {
    return '简直是上帝的宝藏工作！您的工作性价比高得离谱，付出如此少的劳动就能获得这么多回报，简直是打工人的终极梦想！请务必告诉我们您是如何做到的！'
  } else if (score >= 70) {
    return '这工作简直就是打工人的天堂！您的工作性价比高得惊人，付出和回报完全不成正比，简直是天上掉馋饼的好事！请一定要好好珍惜这份工作，它比市场上99%的工作都要好！'
  } else if (score >= 50) {
    return '这工作真的太值了！您的工作性价比非常可观，付出的劳动和压力与获得的回报相比很合理，这在当下社会已经非常难得了！如果有人问您要不要换工作，请大声说“不要”！'
  } else if (score >= 40) {
    return '工作性价比相当不错！您的付出和回报已经超过了大多数打工人，这在当下已经是相当难得的了。虽然还有上升空间，但已经可以自豪地说“我的工作很值”了！'
  } else if (score >= 30) {
    return '工作性价比还可以接受！您的工作付出和回报基本平衡，在当下的就业市场已经算是中上水平了。如果有更好的机会当然可以考虑，但现在的工作已经不错了！'
  } else if (score >= 20) {
    return '工作性价比一般般！您的工作付出和回报就像一碗没有调料的白米饭，能果腹但不太有满足感。如果有更好的机会，可以适当看看，但也不必着急。'
  } else if (score >= 10) {
    return '工作性价比偏低！您付出的劳动和压力与获得的回报不太成正比，就像一个不断漏气的轮胎，需要不断打气才能维持。如果有更好的机会，建议考虑一下。'
  } else if (score >= 5) {
    return '工作性价比很低！您的工作付出和回报严重不成正比，就像一台耗油量巨大的老旧汽车，每开一公里都在大量消耗您的精力。建议积极寻找新的工作机会。'
  } else {
    return '工作性价比差到极点！您的工作就像一个无底洞，无论投入多少精力和时间，都看不到相应的回报。强烈建议立即寻找新的工作机会，这种工作只会消耗您的生命！'
  }
}

// 定义评分结果类型
interface ScoreResult {
  totalScore: number;
  details: ScoreDetails | MissingFieldsDetails | ExtremeValueDetails;
}

interface ScoreDetails {
  salary: number;
  workHours: number;
  vacation: number;
  commute: number;
  cityTier: number;
  colleagues: number;
  companySize: number;
  benefits: number;
  education: number;
}

interface MissingFieldsDetails {
  missingFields: boolean | string[];
}

interface ExtremeValueDetails {
  extremeCase: boolean;
  message: string;
}

// 评分计算函数
function calculateScore(values: WlbForm): ScoreResult {
  // 确保所有必要字段都存在
  if (!values || requiredFields.some(field => values[field] === undefined || values[field] === null)) {
    return { totalScore: 0, details: { missingFields: true } };
  }
  
  // 处理极端情况
  // 1. 超高薪资
  if (values.salary >= 1000) { // 年薪过千万
    return { 
      totalScore: 10000, 
      details: { 
        extremeCase: true,
        message: '年薪过千万？这是乱输入的还是真大老板？给我个工作机会吧！🙏'
      } 
    };
  }
  
  // 2. 超长工作时间
  if (values.workHours > 16) { // 每天工作超过16小时
    return { 
      totalScore: 0, 
      details: { 
        extremeCase: true,
        message: '我觉得还是命比较重要，你不睡觉了吗？？？？马上换工作吧！！！'
      } 
    };
  }
  
  const scoreDetails = {
    salary: 0,
    workHours: 0,
    vacation: 0,
    commute: 0,
    cityTier: 0,
    colleagues: 0,
    companySize: 0,
    benefits: 0,
    education: 0,
  };

  // 税前年薪评分 (0-20分) - 按正态分布计算，考虑年龄因素
  // 根据2024年中国各城市实际薪资数据设置基准
  
  // 定义城市数据类型
  type CityDataRecord = Record<string, number>;
  
  // 城市平均年薪数据 (万元/年)
  const cityAverageSalary: CityDataRecord = {
    '上海': 16.2, // 上海平均年薪16.2万
    '北京': 16.1, // 北京平均年薪16.1万
    '深圳': 15.3, // 深圳平均年薪15.3万
    '杭州': 14.3, // 杭州平均年薪14.3万
    '南京': 13.2, // 南京平均年薪13.2万
    '广州': 13.0, // 广州平均年薪13.0万
    '苏州': 12.8, // 苏州平均年薪12.8万
    '宁波': 12.6, // 宁波平均年薪12.6万
    '珠海': 12.4, // 珠海平均年薪12.4万
    '厦门': 12.0, // 厦门平均年薪12.0万
  };
  
  // 城市分位数据 (75百分位年薪，万元/年)
  const cityPercentile75: CityDataRecord = {
    '上海': 14.4, // 上海前25%人群年薪14.4万
    '北京': 14.4, // 北京前25%人群年薪14.4万
    '深圳': 13.8, // 深圳前25%人群年薪13.8万
    '杭州': 12.0, // 杭州前25%人群年薪12.0万
    '南京': 11.0, // 南京前25%人群年薪11.0万
    '广州': 10.8, // 广州前25%人群年薪10.8万
  };
  
  // 城市中位数据 (50百分位年薪，万元/年)
  const cityMedian: CityDataRecord = {
    '上海': 12.0, // 上海中位年薪12.0万
    '北京': 12.0, // 北京中位年薪12.0万
    '深圳': 11.5, // 深圳中位年薪11.5万
    '杭州': 9.6,  // 杭州中位年薪9.6万
    '南京': 9.0,  // 南京中位年薪9.0万
    '广州': 8.8,  // 广州中位年薪8.8万
  };
  
  // 城市低位数据 (25百分位年薪，万元/年)
  const cityPercentile25: CityDataRecord = {
    '上海': 7.2, // 上海后25%人群年薪7.2万
    '北京': 7.2, // 北京后25%人群年薪7.2万
    '深圳': 7.0, // 深圳后25%人群年薪7.0万
    '杭州': 6.5, // 杭州后25%人群年薪6.5万
    '南京': 6.0, // 南京后25%人群年薪6.0万
    '广州': 5.8, // 广州后25%人群年薪5.8万
  };
  
  // 获取用户所在城市的薪资数据，如果没有特定城市数据，则根据城市等级使用默认值
  const getUserCityData = (city: string) => {
    // 如果有特定城市数据，直接返回
    if (cityAverageSalary[city] !== undefined) {
      return {
        average: cityAverageSalary[city],
        percentile75: cityPercentile75[city] || cityAverageSalary[city] * 1.2,
        median: cityMedian[city] || cityAverageSalary[city] * 0.8,
        percentile25: cityPercentile25[city] || cityAverageSalary[city] * 0.5
      };
    }
    
    // 如果没有特定城市数据，根据城市等级使用默认值
    if (CITY_TIERS.first.includes(city)) {
      return { average: 14.0, percentile75: 12.0, median: 10.0, percentile25: 6.5 };
    } else if (CITY_TIERS.second.includes(city)) {
      return { average: 11.0, percentile75: 9.5, median: 8.0, percentile25: 5.5 };
    } else {
      return { average: 9.0, percentile75: 7.5, median: 6.0, percentile25: 4.0 };
    }
  };
  
  // 获取用户城市的薪资数据
  const cityData = getUserCityData(values.city);
  
  // 根据年龄调整预期薪资 - 年龄因子
  const ageMultiplier = 
    values.age < 22 ? 0.5 : // 22岁以下预期低
    values.age < 25 ? 0.7 : // 22-25岁预期稍低
    values.age < 30 ? 1.0 : // 25-30岁预期标准
    values.age < 35 ? 1.3 : // 30-35岁预期稍高
    values.age < 40 ? 1.6 : // 35-40岁预期高
    values.age < 45 ? 1.8 : // 40-45岁预期更高
    2.0;               // 45岁以上预期最高
  
  // 根据年龄调整各个百分位数据
  const ageAdjustedPercentile25 = cityData.percentile25 * ageMultiplier;
  const ageAdjustedMedian = cityData.median * ageMultiplier;
  const ageAdjustedPercentile75 = cityData.percentile75 * ageMultiplier;
  const ageAdjustedTop = cityData.percentile75 * ageMultiplier * 1.5; // 顶尖薪资标准
  
  // 根据正态分布计算得分 - 使用分位数进行分段计算
  // 降低评分标准，使得分数更宽松
  if (values.salary >= ageAdjustedTop * 0.9) { // 降低10%的顶尖标准
    // 超过顶尖标准，满分
    scoreDetails.salary = 20;
  } else if (values.salary >= ageAdjustedPercentile75 * 0.9) { // 降低10%的前25%标准
    // 前25%人群，高分段 (15-20分)
    const ratio = (values.salary - ageAdjustedPercentile75 * 0.9) / (ageAdjustedTop * 0.9 - ageAdjustedPercentile75 * 0.9);
    scoreDetails.salary = 15 + ratio * 5;
  } else if (values.salary >= ageAdjustedMedian * 0.85) { // 降低15%的中位数标准
    // 中上段人群，中高分段 (10-15分)
    const ratio = (values.salary - ageAdjustedMedian * 0.85) / (ageAdjustedPercentile75 * 0.9 - ageAdjustedMedian * 0.85);
    scoreDetails.salary = 10 + ratio * 5;
  } else if (values.salary >= ageAdjustedPercentile25 * 0.8) { // 降低20%的低位数标准
    // 中下段人群，中低分段 (5-10分)
    const ratio = (values.salary - ageAdjustedPercentile25 * 0.8) / (ageAdjustedMedian * 0.85 - ageAdjustedPercentile25 * 0.8);
    scoreDetails.salary = 5 + ratio * 5;
  } else if (values.salary >= ageAdjustedPercentile25 * 0.4) { // 降低最低标准
    // 低收入人群，低分段 (0-5分)
    const ratio = (values.salary - (ageAdjustedPercentile25 * 0.4)) / (ageAdjustedPercentile25 * 0.4);
    scoreDetails.salary = ratio * 5;
  } else {
    // 极低收入，0分
    scoreDetails.salary = 0;
  }
  
  // 年轻人才加分因子 - 年轻人高薪额外加分
  if (values.age < 25 && values.salary > cityData.percentile75) {
    // 25岁以下达到城市前25%薪资水平，额外加分
    const youthBonus = Math.min(3, (values.salary - cityData.percentile75) / 5); // 每超过5万加上1分，最多3分
    scoreDetails.salary = Math.min(20, scoreDetails.salary + youthBonus);
  }

  // 每日工作时间评分 (0-15分) - 按比例计算
  const minWorkHours = 6; // 6小时或更少得15分
  const maxWorkHours = 12; // 12小时或更多得0分
  
  if (values.workHours <= minWorkHours) {
    scoreDetails.workHours = 15;
  } else if (values.workHours >= maxWorkHours) {
    scoreDetails.workHours = 0;
  } else {
    // 线性插值计算分数
    const ratio = (maxWorkHours - values.workHours) / (maxWorkHours - minWorkHours);
    scoreDetails.workHours = ratio * 15;
  }

  // 年假评分 (0-10分) - 按比例计算
  const minVacation = 0; // 0天得0分
  const maxVacation = 20; // 20天或更多得10分
  
  if (values.vacation <= minVacation) {
    scoreDetails.vacation = 0;
  } else if (values.vacation >= maxVacation) {
    scoreDetails.vacation = 10;
  } else {
    // 线性插值计算分数
    const ratio = (values.vacation - minVacation) / (maxVacation - minVacation);
    scoreDetails.vacation = ratio * 10;
  }

  // 通勤时间评分 (0-10分) - 按比例计算
  const minCommuteTime = 0; // 0分钟得10分
  const maxCommuteTime = 120; // 120分钟或更多得0分
  
  if (values.commuteTime <= minCommuteTime) {
    scoreDetails.commute = 10;
  } else if (values.commuteTime >= maxCommuteTime) {
    scoreDetails.commute = 0;
  } else {
    // 线性插值计算分数
    const ratio = (maxCommuteTime - values.commuteTime) / (maxCommuteTime - minCommuteTime);
    scoreDetails.commute = ratio * 10;
  }

  // 城市等级评分 (0-10分) - 按比例计算
  const cityBaseScore = CITY_TIERS.first.includes(values.city) ? 8 : 
                       CITY_TIERS.second.includes(values.city) ? 5 : 3;
  
  // 根据城市和薪资的组合计算分数
  const cityMedianSalary = values.city === '北京' ? 30 : 
                          values.city === '上海' ? 28 : 
                          CITY_TIERS.first.includes(values.city) ? 25 : 
                          CITY_TIERS.second.includes(values.city) ? 20 : 15;
  
  // 薪资与城市匹配度评分
  const salaryRatio = Math.min(1, values.salary / cityMedianSalary);
  scoreDetails.cityTier = cityBaseScore * salaryRatio + (10 - cityBaseScore) * (values.salary / (cityMedianSalary * 2));

  // 同事素质评分 (0-10分) - 组合计算，增加学历差距奖励
  const eduLevels: Record<string, number> = {
    'highSchool': 1,
    'college': 2,
    'bachelor': 3,
    'master': 4,
    'phd': 5
  };
  
  const userEduLevel = eduLevels[values.education] || 0;
  const colleaguesEduLevel = eduLevels[values.colleaguesEducation] || 0;
  
  // 学历差距评分 (0-6分) - 增加权重
  let eduDiffScore = 0;
  if (colleaguesEduLevel > userEduLevel) {
    // 同事学历高于用户，越高越好 - 增加奖励
    const diff = colleaguesEduLevel - userEduLevel;
    eduDiffScore = 6 * diff / 4; // 最高6分，增加奖励
    eduDiffScore = Math.min(6, eduDiffScore);
    
    // 如果差距超过2级，额外奖励
    if (diff >= 2) {
      eduDiffScore += 0.5; // 额外奖励
    }
  } else if (colleaguesEduLevel < userEduLevel) {
    // 用户学历高于同事，差距越小越好
    eduDiffScore = 3 * (1 - (userEduLevel - colleaguesEduLevel) / 4);
    eduDiffScore = Math.max(0, eduDiffScore);
  } else {
    // 相等
    eduDiffScore = 3;
  }
  
  // 同事外表评分 (0-3分)
  const appearanceScore = Math.min(3, (values.colleaguesAppearance - 1) * 0.75);
  
  // 同事能力评分 (0-2分)
  const competenceScore = Math.min(2, (values.colleaguesCompetence - 1) * 0.22);
  
  // 组合总分
  scoreDetails.colleagues = eduDiffScore + appearanceScore + competenceScore;

  // 公司规模评分 (0-10分) - 组合计算，更细化评分
  // 基础分数
  const companySizeBaseScores = {
    'giant': 8,       // 大厂基础分
    'enterprise': 7,  // 大型企业基础分
    'large': 6,       // 大型公司基础分
    'medium': 5,      // 中型公司基础分
    'small': 3,       // 小型公司基础分
    'startup': 2      // 初创公司基础分
  };
  
  // 获取基础分数
  const baseScore = companySizeBaseScores[values.companySize as keyof typeof companySizeBaseScores] || 0;
  
  // 根据公司规模和薪资关系调整分数
  let sizeAdjustment = 0;
  
  // 大公司高薪 - 最理想的组合
  if ((values.companySize === 'giant' || values.companySize === 'enterprise') && values.salary > cityData.percentile75) {
    sizeAdjustment = 2; // 大公司+高薪加分
  } 
  // 小公司高薪 - 也不错的组合
  else if ((values.companySize === 'small' || values.companySize === 'startup') && values.salary > cityData.median) {
    sizeAdjustment = 1.5; // 小公司+高薪加分
  }
  // 大公司低薪 - 不太理想的组合
  else if ((values.companySize === 'giant' || values.companySize === 'enterprise') && values.salary < cityData.percentile25) {
    sizeAdjustment = -1; // 大公司+低薪减分
  }
  
  // 计算最终分数
  scoreDetails.companySize = Math.min(10, Math.max(0, baseScore + sizeAdjustment));

  // 每日福利价值评分 (0-8分) - 按比例计算
  const minBenefits = 0;   // 0元得0分
  const maxBenefits = 200; // 200元或更多得8分
  
  if (values.benefits <= minBenefits) {
    scoreDetails.benefits = 0;
  } else if (values.benefits >= maxBenefits) {
    scoreDetails.benefits = 8;
  } else {
    // 线性插值计算分数
    const ratio = (values.benefits - minBenefits) / (maxBenefits - minBenefits);
    scoreDetails.benefits = ratio * 8;
  }

  // 学历与人均学历匹配评分 (0-10分) - 调整计算方式，增加学历低于同事的奖励
  const eduDiff = userEduLevel - colleaguesEduLevel;
  
  if (eduDiff > 0) {
    // 用户学历高于团队平均 - 一般评分
    scoreDetails.education = Math.min(10, 5 + eduDiff * 1.5);
  } else if (eduDiff < 0) {
    // 用户学历低于团队平均 - 增加奖励
    const absDiff = Math.abs(eduDiff);
    // 学历差距越大，奖励越高
    scoreDetails.education = Math.min(10, 6 + absDiff * 2);
    
    // 如果差距大于等于2级，额外奖励
    if (absDiff >= 2) {
      scoreDetails.education = Math.min(10, scoreDetails.education + 1);
    }
  } else {
    // 相等 - 一般评分
    scoreDetails.education = 5;
  }

  // 计算总分
  let weightedTotal = 0;
  let weightSum = 0;
  
  Object.keys(scoreDetails).forEach(key => {
    const weight = WEIGHTS[key as keyof typeof WEIGHTS];
    if (weight !== undefined) {
      // 将分数按满分比例计算
      const maxPossibleScore = weight; // 每个类别的满分即为其权重
      const categoryScore = scoreDetails[key as keyof typeof scoreDetails];
      weightedTotal += categoryScore;
      weightSum += maxPossibleScore;
    }
  });
  
  // 计算百分制分数
  const totalScore = weightSum > 0 ? (weightedTotal / weightSum) * 100 : 0;
  
  // 确保分数在0-100之间
  const normalizedScore = Math.min(100, Math.max(0, totalScore));

  return { totalScore: normalizedScore, details: scoreDetails };
}