import { selectCaptchaUrl, selectThemeMode, setCaptchaUrlAC, setIsLoggedInAC } from '@/app/app-slice'
import { AUTH_TOKEN } from '@/common/constants'
import { ResultCode } from '@/common/enums'
import { useAppDispatch, useAppSelector } from '@/common/hooks'
import { getTheme } from '@/common/theme'
import { useLazyCaptchaQuery, useLoginMutation } from '@/features/auth/api/authApi'
import { type Inputs, loginSchema } from '@/features/auth/lib/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import FormLabel from '@mui/material/FormLabel'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'
import styles from './Login.module.css'
import { useEffect } from 'react';

export const Login = () => {
    const dispatch = useAppDispatch()
    const themeMode = useAppSelector(selectThemeMode)
    const captchaUrl = useAppSelector(selectCaptchaUrl)
    const theme = getTheme(themeMode)

    const [fetchCaptcha, { data: captchaData }] = useLazyCaptchaQuery()

    const [login] = useLoginMutation()

    useEffect(() => {
        if (captchaData?.url) {
            dispatch(setCaptchaUrlAC({ captchaUrl: captchaData.url }))
        }
    }, [captchaData?.url, dispatch])

    const {
        register,
        handleSubmit,
        reset,
        control,
        setError,
        formState: { errors },
    } = useForm<Inputs>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', rememberMe: false, captcha: '' },
    })



    const onSubmit: SubmitHandler<Inputs> = async (formData) => {
        try {
            const result = await login({
                email: formData.email,
                password: formData.password,
                rememberMe: formData.rememberMe,
                captcha: captchaUrl ? formData.captcha : undefined
            })

            if ('data' in result) {
                if (result.data?.resultCode === ResultCode.Success) {
                    dispatch(setIsLoggedInAC({ isLoggedIn: true }))
                    localStorage.setItem(AUTH_TOKEN, result.data?.data.token)
                    dispatch(setCaptchaUrlAC({ captchaUrl: undefined }))
                    // dispatch(api.util.invalidateTags(['Captcha']))
                    reset()
                }
                else if (result.data?.resultCode === ResultCode.CaptchaError) {
                    // Только при ошибке капчи делаем запрос за новой капчей
                    await fetchCaptcha()
                    setError('root', { message: 'Please enter the captcha' })
                }
                else {
                    setError('root', { message: result.data?.messages[0] || 'Login failed' })
                }
            }
        } catch (error) {
            setError('root', { message: 'Network error occurred' })
        }
    }

    return (
        <Grid container justifyContent={'center'}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <FormControl>
                    <FormLabel>
                        <p>
                            To login get registered
                            <a
                                style={{ color: theme.palette.primary.main, marginLeft: '5px' }}
                                href="https://social-network.samuraijs.com"
                                target="_blank"
                                rel="noreferrer"
                            >
                                here
                            </a>
                        </p>
                        <p>or use common test account credentials:</p>
                        <p><b>Email:</b> free@samuraijs.com</p>
                        <p><b>Password:</b> free</p>
                    </FormLabel>
                    <FormGroup>
                        <TextField
                            label="Email"
                            margin="normal"
                            error={!!errors.email}
                            {...register('email')}
                        />
                        {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}

                        <TextField
                            type="password"
                            label="Password"
                            margin="normal"
                            error={!!errors.password}
                            {...register('password')}
                        />
                        {errors.password && <span className={styles.errorMessage}>{errors.password.message}</span>}

                        {captchaUrl && (
                            <>
                                <img src={captchaUrl} alt="captcha" style={{ margin: '10px 0' }} />
                                <TextField
                                    label="Captcha"
                                    margin="normal"
                                    error={!!errors.captcha}
                                    {...register('captcha')}
                                />
                                {errors.captcha && <span className={styles.errorMessage}>{errors.captcha.message}</span>}
                            </>
                        )}

                        {errors.root && (
                            <span className={styles.errorMessage}>{errors.root.message}</span>
                        )}

                        <FormControlLabel
                            label={'Remember me'}
                            control={
                                <Controller
                                    name={'rememberMe'}
                                    control={control}
                                    render={({ field: { value, ...field } }) => (
                                        <Checkbox {...field} checked={value} />
                                    )}
                                />
                            }
                        />

                        <Button type="submit" variant="contained" color="primary">
                            Login
                        </Button>
                    </FormGroup>
                </FormControl>
            </form>
        </Grid>
    )
}