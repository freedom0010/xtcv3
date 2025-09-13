import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Heart, 
  Activity, 
  Pill, 
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  Home,
  DollarSign,
  Cigarette,
  Wine,
  Coffee,
  Moon,
  Zap,
  Scale,
  Thermometer,
  Eye,
  Kidney,
  Brain,
  Shield,
  Send,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'

export default function ComprehensiveSurvey({ onSubmit, isSubmitting, fhevmReady, ipfsReady }) {
  const [currentModule, setCurrentModule] = useState(1)
  const totalModules = 4

  const [formData, setFormData] = useState({
    // 模块1: 基本人口学信息
    age: '',
    gender: '',
    ethnicity: '',
    education: '',
    occupation: '',
    maritalStatus: '',
    householdSize: '',
    income: '',
    insurance: '',
    location: '',
    
    // 模块2: 医疗史和健康状况
    diabetesType: '',
    diagnosisAge: '',
    familyHistory: '',
    comorbidities: [],
    allergies: '',
    previousHospitalizations: '',
    surgicalHistory: '',
    currentSymptoms: [],
    painLevel: '',
    functionalStatus: '',
    
    // 模块3: 生活方式因素
    smokingStatus: '',
    smokingHistory: '',
    alcoholConsumption: '',
    physicalActivity: '',
    exerciseFrequency: '',
    dietType: '',
    sleepHours: '',
    sleepQuality: '',
    stressLevel: '',
    socialSupport: '',
    
    // 模块4: 治疗和管理
    currentMedications: '',
    medicationAdherence: '',
    bloodGlucoseMonitoring: '',
    hba1cLevel: '',
    bloodPressure: '',
    cholesterolLevel: '',
    bmi: '',
    complications: [],
    healthcareVisits: '',
    selfCareActivities: []
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked 
          ? [...(prev[name] || []), value]
          : (prev[name] || []).filter(item => item !== value)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const nextModule = () => {
    if (currentModule < totalModules) {
      setCurrentModule(currentModule + 1)
    }
  }

  const prevModule = () => {
    if (currentModule > 1) {
      setCurrentModule(currentModule - 1)
    }
  }

  const renderModule = () => {
    switch (currentModule) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3 mb-8">
              <User className="w-7 h-7 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-800">基本人口学信息</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  年龄
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="请输入年龄"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  性别
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">请选择</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  民族
                </label>
                <select
                  name="ethnicity"
                  value={formData.ethnicity}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">请选择</option>
                  <option value="han">汉族</option>
                  <option value="minority">少数民族</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <GraduationCap className="w-4 h-4 inline mr-1" />
                  教育程度
                </label>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">请选择</option>
                  <option value="primary">小学</option>
                  <option value="middle">初中</option>
                  <option value="high">高中</option>
                  <option value="college">大专</option>
                  <option value="bachelor">本科</option>
                  <option value="master">硕士</option>
                  <option value="phd">博士</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  职业
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  placeholder="请输入职业"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Heart className="w-4 h-4 inline mr-1" />
                  婚姻状况
                </label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">请选择</option>
                  <option value="single">未婚</option>
                  <option value="married">已婚</option>
                  <option value="divorced">离异</option>
                  <option value="widowed">丧偶</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Home className="w-4 h-4 inline mr-1" />
                  家庭人数
                </label>
                <input
                  type="number"
                  name="householdSize"
                  value={formData.householdSize}
                  onChange={handleInputChange}
                  placeholder="请输入家庭人数"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  家庭年收入
                </label>
                <select
                  name="income"
                  value={formData.income}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">请选择</option>
                  <option value="low">5万以下</option>
                  <option value="medium-low">5-10万</option>
                  <option value="medium">10-20万</option>
                  <option value="medium-high">20-50万</option>
                  <option value="high">50万以上</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="w-4 h-4 inline mr-1" />
                  医疗保险
                </label>
                <select
                  name="insurance"
                  value={formData.insurance}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">请选择</option>
                  <option value="urban">城镇职工医保</option>
                  <option value="rural">新农合</option>
                  <option value="resident">城乡居民医保</option>
                  <option value="commercial">商业保险</option>
                  <option value="none">无保险</option>
                </select>
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3 mb-8">
              <Heart className="w-7 h-7 text-red-600" />
              <h3 className="text-2xl font-bold text-gray-800">医疗史和健康状况</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  糖尿病类型
                </label>
                <select
                  name="diabetesType"
                  value={formData.diabetesType}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">请选择</option>
                  <option value="type1">1型糖尿病</option>
                  <option value="type2">2型糖尿病</option>
                  <option value="gestational">妊娠糖尿病</option>
                  <option value="mody">MODY</option>
                  <option value="secondary">继发性糖尿病</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  确诊年龄
                </label>
                <input
                  type="number"
                  name="diagnosisAge"
                  value={formData.diagnosisAge}
                  onChange={handleInputChange}
                  placeholder="请输入确诊时的年龄"
                  className="input-field"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  家族史
                </label>
                <textarea
                  name="familyHistory"
                  value={formData.familyHistory}
                  onChange={handleInputChange}
                  placeholder="请详细描述家族中糖尿病及其他疾病史"
                  rows={3}
                  className="input-field resize-none"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  合并症 (可多选)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: 'hypertension', label: '高血压', icon: Heart },
                    { value: 'dyslipidemia', label: '血脂异常', icon: Activity },
                    { value: 'obesity', label: '肥胖', icon: Scale },
                    { value: 'nephropathy', label: '糖尿病肾病', icon: Kidney },
                    { value: 'retinopathy', label: '糖尿病视网膜病变', icon: Eye },
                    { value: 'neuropathy', label: '糖尿病神经病变', icon: Brain }
                  ].map(({ value, label, icon: Icon }) => (
                    <label key={value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        name="comorbidities"
                        value={value}
                        checked={formData.comorbidities?.includes(value)}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  药物过敏史
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  placeholder="请描述药物过敏情况"
                  rows={2}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  住院史
                </label>
                <textarea
                  name="previousHospitalizations"
                  value={formData.previousHospitalizations}
                  onChange={handleInputChange}
                  placeholder="请描述既往住院情况"
                  rows={2}
                  className="input-field resize-none"
                />
              </div>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3 mb-8">
              <Activity className="w-7 h-7 text-green-600" />
              <h3 className="text-2xl font-bold text-gray-800">生活方式因素</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Cigarette className="w-4 h-4 inline mr-1" />
                  吸烟状况
                </label>
                <select
                  name="smokingStatus"
                  value={formData.smokingStatus}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">请选择</option>
                  <option value="never">从不吸烟</option>
                  <option value="former">已戒烟</option>
                  <option value="current">目前吸烟</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Wine className="w-4 h-4 inline mr-1" />
                  饮酒情况
                </label>
                <select
                  name="alcoholConsumption"
                  value={formData.alcoholConsumption}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">请选择</option>
                  <option value="never">从不饮酒</option>
                  <option value="occasional">偶尔饮酒</option>
                  <option value="moderate">适量饮酒</option>
                  <option value="heavy">大量饮酒</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Zap className="w-4 h-4 inline mr-1" />
                  体力活动水平
                </label>
                <select
                  name="physicalActivity"
                  value={formData.physicalActivity}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">请选择</option>
                  <option value="sedentary">久坐不动</option>
                  <option value="light">轻度活动</option>
                  <option value="moderate">中度活动</option>
                  <option value="vigorous">高强度活动</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  运动频率
                </label>
                <select
                  name="exerciseFrequency"
                  value={formData.exerciseFrequency}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">请选择</option>
                  <option value="never">从不运动</option>
                  <option value="rarely">很少运动</option>
                  <option value="weekly">每周1-2次</option>
                  <option value="regular">每周3-4次</option>
                  <option value="daily">每天运动</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Coffee className="w-4 h-4 inline mr-1" />
                  饮食类型
                </label>
                <select
                  name="dietType"
                  value={formData.dietType}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">请选择</option>
                  <option value="regular">普通饮食</option>
                  <option value="diabetic">糖尿病饮食</option>
                  <option value="low-carb">低碳水化合物</option>
                  <option value="mediterranean">地中海饮食</option>
                  <option value="vegetarian">素食</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Moon className="w-4 h-4 inline mr-1" />
                  睡眠时间 (小时)
                </label>
                <input
                  type="number"
                  name="sleepHours"
                  value={formData.sleepHours}
                  onChange={handleInputChange}
                  placeholder="平均每晚睡眠时间"
                  min="0"
                  max="24"
                  step="0.5"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  睡眠质量
                </label>
                <select
                  name="sleepQuality"
                  value={formData.sleepQuality}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">请选择</option>
                  <option value="excellent">非常好</option>
                  <option value="good">好</option>
                  <option value="fair">一般</option>
                  <option value="poor">差</option>
                  <option value="very-poor">非常差</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  压力水平
                </label>
                <select
                  name="stressLevel"
                  value={formData.stressLevel}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">请选择</option>
                  <option value="very-low">非常低</option>
                  <option value="low">低</option>
                  <option value="moderate">中等</option>
                  <option value="high">高</option>
                  <option value="very-high">非常高</option>
                </select>
              </div>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3 mb-8">
              <Pill className="w-7 h-7 text-purple-600" />
              <h3 className="text-2xl font-bold text-gray-800">治疗和管理</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  目前用药情况
                </label>
                <textarea
                  name="currentMedications"
                  value={formData.currentMedications}
                  onChange={handleInputChange}
                  placeholder="请详细列出目前使用的所有药物，包括剂量和频次"
                  rows={4}
                  className="input-field resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用药依从性
                </label>
                <select
                  name="medicationAdherence"
                  value={formData.medicationAdherence}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">请选择</option>
                  <option value="excellent">非常好</option>
                  <option value="good">好</option>
                  <option value="fair">一般</option>
                  <option value="poor">差</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  血糖监测频率
                </label>
                <select
                  name="bloodGlucoseMonitoring"
                  value={formData.bloodGlucoseMonitoring}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">请选择</option>
                  <option value="multiple-daily">每日多次</option>
                  <option value="daily">每日一次</option>
                  <option value="weekly">每周几次</option>
                  <option value="monthly">每月几次</option>
                  <option value="rarely">很少监测</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Thermometer className="w-4 h-4 inline mr-1" />
                  最近HbA1c水平 (%)
                </label>
                <input
                  type="number"
                  name="hba1cLevel"
                  value={formData.hba1cLevel}
                  onChange={handleInputChange}
                  placeholder="请输入最近的HbA1c值"
                  step="0.1"
                  min="4"
                  max="20"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  血压 (mmHg)
                </label>
                <input
                  type="text"
                  name="bloodPressure"
                  value={formData.bloodPressure}
                  onChange={handleInputChange}
                  placeholder="例如: 120/80"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Scale className="w-4 h-4 inline mr-1" />
                  BMI
                </label>
                <input
                  type="number"
                  name="bmi"
                  value={formData.bmi}
                  onChange={handleInputChange}
                  placeholder="请输入BMI值"
                  step="0.1"
                  min="10"
                  max="50"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  就医频率
                </label>
                <select
                  name="healthcareVisits"
                  value={formData.healthcareVisits}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">请选择</option>
                  <option value="monthly">每月</option>
                  <option value="quarterly">每季度</option>
                  <option value="biannually">每半年</option>
                  <option value="annually">每年</option>
                  <option value="as-needed">需要时</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  自我护理活动 (可多选)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: 'diet-planning', label: '饮食计划' },
                    { value: 'exercise', label: '规律运动' },
                    { value: 'glucose-monitoring', label: '血糖监测' },
                    { value: 'foot-care', label: '足部护理' },
                    { value: 'medication-management', label: '药物管理' },
                    { value: 'stress-management', label: '压力管理' }
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        name="selfCareActivities"
                        value={value}
                        checked={formData.selfCareActivities?.includes(value)}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            模块 {currentModule} / {totalModules}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentModule / totalModules) * 100)}% 完成
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(currentModule / totalModules) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {renderModule()}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-10">
          <button
            type="button"
            onClick={prevModule}
            disabled={currentModule === 1}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              currentModule === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>上一模块</span>
          </button>

          {currentModule < totalModules ? (
            <button
              type="button"
              onClick={nextModule}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 hover:shadow-md transition-all"
            >
              <span>下一模块</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className={`
                flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all
                ${isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>提交中...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>提交调查问卷</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </form>

      {/* Privacy and System Status */}
      <div className="mt-8 space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">隐私保护承诺</h4>
              <p className="text-sm text-blue-700">
                您的所有健康数据将使用FHEVM同态加密技术进行保护，确保数据在传输、存储和分析过程中始终保持加密状态。
                我们承诺严格保护您的个人隐私，所有数据仅用于医学研究目的。
              </p>
              <div className="mt-2 flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${fhevmReady ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className={fhevmReady ? 'text-green-700' : 'text-yellow-700'}>
                    FHEVM {fhevmReady ? '已连接' : '模拟模式'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${ipfsReady ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className={ipfsReady ? 'text-green-700' : 'text-yellow-700'}>
                    IPFS {ipfsReady ? '已连接' : '模拟模式'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}