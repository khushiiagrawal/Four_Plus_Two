package dev.adithya.aquahealth.common.di

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import dev.adithya.aquahealth.alert.AlertRepository
import dev.adithya.aquahealth.alert.AlertRepositoryImpl
import dev.adithya.aquahealth.onboarding.repository.SignOnRepository
import dev.adithya.aquahealth.onboarding.repository.SignOnRepositoryImpl
import dev.adithya.aquahealth.report.repository.UserReportRepository
import dev.adithya.aquahealth.report.repository.UserReportRepositoryImpl
import dev.adithya.aquahealth.settings.repository.SettingsRepository
import dev.adithya.aquahealth.settings.repository.SettingsRepositoryImpl
import dev.adithya.aquahealth.user.repository.UserRepository
import dev.adithya.aquahealth.user.repository.UserRepositoryImpl
import dev.adithya.aquahealth.watersource.repository.WaterSourceRepository
import dev.adithya.aquahealth.watersource.repository.WaterSourceRepositoryImpl
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindUserRepository(
        impl: UserRepositoryImpl
    ): UserRepository

    @Binds
    @Singleton
    abstract fun bindSignOnRepository(
        impl: SignOnRepositoryImpl
    ): SignOnRepository

    @Binds
    @Singleton
    abstract fun bindAlertRepository(
        impl: AlertRepositoryImpl
    ): AlertRepository

    @Binds
    @Singleton
    abstract fun bindWaterSourceRepository(
        impl: WaterSourceRepositoryImpl
    ): WaterSourceRepository

    @Binds
    @Singleton
    abstract fun bindUserReportRepository(
        impl: UserReportRepositoryImpl
    ): UserReportRepository

    @Binds
    @Singleton
    abstract fun bindSettingsRepository(
        impl: SettingsRepositoryImpl
    ): SettingsRepository
}