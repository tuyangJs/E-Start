
// 一个简化版的系统验证函数，仅触发系统生物识别弹窗
export async function triggerSystemBiometric(): Promise<boolean> {
    if (!(window.PublicKeyCredential && navigator.credentials)) {
        return false;
    }

    try {
        const cred = await navigator.credentials.get({
            publicKey: {
                challenge: new Uint8Array(16).buffer,
                timeout: 60000,
                userVerification: 'required',
                allowCredentials: []
            }
        });
        return !!cred;
    } catch (err: any) {
        console.error('验证异常', err);
        if (err.name === 'NotAllowedError' || err.name === 'ConstraintError') {
        } else {
        }
        return false;
    }
}



