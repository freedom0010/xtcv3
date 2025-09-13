import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'next-i18next'
import filebaseService from '../services/filebaseService'
import { 
  User, 
  Heart, 
  Activity, 
  Calendar, 
  Pill, 
  Scale, 
  Droplets,
  Clock,
  FileText,
  Send,
  Shield
} from 'lucide-react'

export default function DiabetesSurvey({ onSubmit, isSubmitting }) {
  const { t } = useTranslation('common')
  
  const [formData, setFormData] = useState({
    // Basic information
    age: '',
    gender: '',
    height: '',
    weight: '',
    
    // Diabetes related
    diabetesType: '',
    diagnosisYear: '',
    bloodSugar: '',
    hba1c: '',
    
    // Lifestyle
    exercise: '',
    diet: '',
    smoking: '',
    alcohol: '',
    
    // Treatment
    medication: '',
    insulin: '',
    complications: '',
    
    // Other
    familyHistory: '',
    notes: ''
  })

  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear corresponding field error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Basic information validation
    if (!formData.age) newErrors.age = t('diabetesSurvey.validation.ageRequired')
    if (!formData.gender) newErrors.gender = t('diabetesSurvey.validation.genderRequired')
    if (!formData.height) newErrors.height = t('diabetesSurvey.validation.heightRequired')
    if (!formData.weight) newErrors.weight = t('diabetesSurvey.validation.weightRequired')

    // Diabetes related validation
    if (!formData.diabetesType) newErrors.diabetesType = t('diabetesSurvey.validation.diabetesTypeRequired')
    if (!formData.diagnosisYear && formData.diabetesType !== 'none') {
      newErrors.diagnosisYear = t('diabetesSurvey.validation.diagnosisYearRequired')
    }
    if (!formData.bloodSugar) {
      newErrors.bloodSugar = t('diabetesSurvey.validation.bloodSugarRequired')
    } else if (parseFloat(formData.bloodSugar) < 0) {
      newErrors.bloodSugar = t('diabetesSurvey.validation.bloodSugarInvalid')
    }

    // Lifestyle validation
    if (!formData.exercise) newErrors.exercise = t('diabetesSurvey.validation.exerciseRequired')
    if (!formData.diet) newErrors.diet = t('diabetesSurvey.validation.dietRequired')
    if (!formData.smoking) newErrors.smoking = t('diabetesSurvey.validation.smokingRequired')
    if (!formData.alcohol) newErrors.alcohol = t('diabetesSurvey.validation.alcoholRequired')

    // Treatment validation
    if (!formData.insulin) newErrors.insulin = t('diabetesSurvey.validation.insulinRequired')
    if (!formData.familyHistory) newErrors.familyHistory = t('diabetesSurvey.validation.familyHistoryRequired')

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Calculate BMI
    const height = parseFloat(formData.height) / 100 // Convert to meters
    const weight = parseFloat(formData.weight)
    const bmi = weight / (height * height)

    const surveyData = {
      ...formData,
      bmi: bmi.toFixed(1),
      submittedAt: new Date().toISOString()
    }

    await onSubmit(surveyData)
  }

  const formSections = [
    {
      title: t('diabetesSurvey.basicInfo'),
      icon: User,
      fields: [
        {
          name: 'age',
          label: t('diabetesSurvey.fields.age'),
          type: 'number',
          placeholder: t('diabetesSurvey.placeholders.age'),
          min: 1,
          max: 120
        },
        {
          name: 'gender',
          label: t('diabetesSurvey.fields.gender'),
          type: 'select',
          options: [
            { value: '', label: t('diabetesSurvey.fields.gender') },
            { value: 'male', label: t('diabetesSurvey.options.gender.male') },
            { value: 'female', label: t('diabetesSurvey.options.gender.female') },
            { value: 'other', label: t('diabetesSurvey.options.gender.other') }
          ]
        },
        {
          name: 'height',
          label: t('diabetesSurvey.fields.height'),
          type: 'number',
          placeholder: t('diabetesSurvey.placeholders.height'),
          min: 50,
          max: 250
        },
        {
          name: 'weight',
          label: t('diabetesSurvey.fields.weight'),
          type: 'number',
          placeholder: t('diabetesSurvey.placeholders.weight'),
          min: 20,
          max: 300
        }
      ]
    },
    {
      title: t('diabetesSurvey.diabetesInfo'),
      icon: Heart,
      fields: [
        {
          name: 'diabetesType',
          label: t('diabetesSurvey.fields.diabetesType'),
          type: 'select',
          options: [
            { value: '', label: t('diabetesSurvey.fields.diabetesType') },
            { value: 'none', label: t('diabetesSurvey.options.diabetesType.none') },
            { value: 'type1', label: t('diabetesSurvey.options.diabetesType.type1') },
            { value: 'type2', label: t('diabetesSurvey.options.diabetesType.type2') },
            { value: 'gestational', label: t('diabetesSurvey.options.diabetesType.gestational') },
            { value: 'other', label: t('diabetesSurvey.options.diabetesType.other') }
          ]
        },
        {
          name: 'diagnosisYear',
          label: t('diabetesSurvey.fields.diagnosisYear'),
          type: 'number',
          placeholder: t('diabetesSurvey.placeholders.diagnosisYear'),
          min: 1950,
          max: new Date().getFullYear()
        },
        {
          name: 'bloodSugar',
          label: t('diabetesSurvey.fields.bloodSugar'),
          type: 'number',
          placeholder: t('diabetesSurvey.placeholders.bloodSugar'),
          min: 0,
          max: 50,
          step: 0.1
        },
        {
          name: 'hba1c',
          label: t('diabetesSurvey.fields.hba1c'),
          type: 'number',
          placeholder: t('diabetesSurvey.placeholders.hba1c'),
          min: 0,
          max: 20,
          step: 0.1
        }
      ]
    },
    {
      title: t('diabetesSurvey.lifestyle'),
      icon: Activity,
      fields: [
        {
          name: 'exercise',
          label: t('diabetesSurvey.fields.exercise'),
          type: 'select',
          options: [
            { value: '', label: t('diabetesSurvey.fields.exercise') },
            { value: 'never', label: t('diabetesSurvey.options.exercise.never') },
            { value: 'rarely', label: t('diabetesSurvey.options.exercise.rarely') },
            { value: 'sometimes', label: t('diabetesSurvey.options.exercise.sometimes') },
            { value: 'often', label: t('diabetesSurvey.options.exercise.often') },
            { value: 'daily', label: t('diabetesSurvey.options.exercise.daily') }
          ]
        },
        {
          name: 'diet',
          label: t('diabetesSurvey.fields.diet'),
          type: 'select',
          options: [
            { value: '', label: t('diabetesSurvey.fields.diet') },
            { value: 'none', label: t('diabetesSurvey.options.diet.none') },
            { value: 'basic', label: t('diabetesSurvey.options.diet.basic') },
            { value: 'moderate', label: t('diabetesSurvey.options.diet.moderate') },
            { value: 'strict', label: t('diabetesSurvey.options.diet.strict') }
          ]
        },
        {
          name: 'smoking',
          label: t('diabetesSurvey.fields.smoking'),
          type: 'select',
          options: [
            { value: '', label: t('diabetesSurvey.fields.smoking') },
            { value: 'never', label: t('diabetesSurvey.options.smoking.never') },
            { value: 'former', label: t('diabetesSurvey.options.smoking.former') },
            { value: 'current', label: t('diabetesSurvey.options.smoking.current') }
          ]
        },
        {
          name: 'alcohol',
          label: t('diabetesSurvey.fields.alcohol'),
          type: 'select',
          options: [
            { value: '', label: t('diabetesSurvey.fields.alcohol') },
            { value: 'never', label: t('diabetesSurvey.options.alcohol.never') },
            { value: 'rarely', label: t('diabetesSurvey.options.alcohol.rarely') },
            { value: 'sometimes', label: t('diabetesSurvey.options.alcohol.sometimes') },
            { value: 'often', label: t('diabetesSurvey.options.alcohol.often') }
          ]
        }
      ]
    },
    {
      title: t('diabetesSurvey.treatment'),
      icon: Pill,
      fields: [
        {
          name: 'medication',
          label: t('diabetesSurvey.fields.medication'),
          type: 'textarea',
          placeholder: t('diabetesSurvey.placeholders.medication')
        },
        {
          name: 'insulin',
          label: t('diabetesSurvey.fields.insulin'),
          type: 'select',
          options: [
            { value: '', label: t('diabetesSurvey.fields.insulin') },
            { value: 'no', label: t('diabetesSurvey.options.insulin.no') },
            { value: 'yes', label: t('diabetesSurvey.options.insulin.yes') },
            { value: 'considering', label: t('diabetesSurvey.options.insulin.considering') }
          ]
        },
        {
          name: 'complications',
          label: t('diabetesSurvey.fields.complications'),
          type: 'textarea',
          placeholder: t('diabetesSurvey.placeholders.complications')
        }
      ]
    },
    {
      title: t('diabetesSurvey.other'),
      icon: FileText,
      fields: [
        {
          name: 'familyHistory',
          label: t('diabetesSurvey.fields.familyHistory'),
          type: 'select',
          options: [
            { value: '', label: t('diabetesSurvey.fields.familyHistory') },
            { value: 'no', label: t('diabetesSurvey.options.familyHistory.no') },
            { value: 'yes', label: t('diabetesSurvey.options.familyHistory.yes') },
            { value: 'unknown', label: t('diabetesSurvey.options.familyHistory.unknown') }
          ]
        },
        {
          name: 'notes',
          label: t('diabetesSurvey.fields.notes'),
          type: 'textarea',
          placeholder: t('diabetesSurvey.placeholders.notes')
        }
      ]
    }
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('diabetesSurvey.title')}</h2>
        
        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <Shield className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-semibold text-blue-800">{t('diabetesSurvey.privacy.title')}</h3>
          </div>
          <p className="text-sm text-blue-700">{t('diabetesSurvey.privacy.description')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {formSections.map((section, sectionIndex) => {
          const IconComponent = section.icon
          return (
            <motion.div
              key={sectionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="border border-gray-200 rounded-lg p-6"
            >
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <IconComponent className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    
                    {field.type === 'select' ? (
                      <select
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[field.name] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        {field.options.map((option, optionIndex) => (
                          <option key={optionIndex} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[field.name] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[field.name] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    )}
                    
                    {errors[field.name] && (
                      <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t('diabetesSurvey.buttons.submitting')}
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                {t('diabetesSurvey.buttons.submit')}
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  )
}